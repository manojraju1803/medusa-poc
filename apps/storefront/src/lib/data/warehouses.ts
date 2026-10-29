"use server"

import { sdk } from "@lib/config"
import {
  ActiveWarehouse,
  AvailabilityMap,
  StoreLocation,
  Warehouse,
} from "types/warehouse"
import { cookies as nextCookies } from "next/headers"
import { getAuthHeaders, getCacheOptions } from "./cookies"

const WAREHOUSE_COOKIE = "_ib_warehouse_id"
const WAREHOUSE_COOKIE_MAX_AGE = 60 * 60 * 24 * 180

// The backend's per-request limit for /store/warehouse-availability.
const AVAILABILITY_IDS_PER_REQUEST = 100

// Stock changes without anything happening on the storefront, so availability
// expires on its own instead of waiting for a cache tag to be cleared.
const AVAILABILITY_MAX_AGE_SECONDS = 60

// Warehouses are edited in the admin, which can't clear the storefront's
// cache, so the list expires on its own.
const WAREHOUSES_MAX_AGE_SECONDS = 300

export const listWarehouses = async (): Promise<Warehouse[]> => {
  const next = {
    ...(await getCacheOptions("warehouses")),
    revalidate: WAREHOUSES_MAX_AGE_SECONDS,
  }

  return sdk.client
    .fetch<{ warehouses: Warehouse[] }>("/store/warehouses", {
      method: "GET",
      next,
    })
    .then(({ warehouses }) => warehouses ?? [])
    .catch(() => [])
}

export const getSelectedWarehouseId = async (): Promise<string | undefined> => {
  const cookies = await nextCookies()
  return cookies.get(WAREHOUSE_COOKIE)?.value
}

/**
 * Makes a warehouse the buyer's choice: in this browser, and on their account
 * when signed in, so it follows them to another device.
 */
export const setSelectedWarehouseId = async (warehouseId: string) => {
  const headers = await getAuthHeaders()

  if ("authorization" in headers) {
    await sdk.client
      .fetch("/store/location", {
        method: "POST",
        headers,
        body: { warehouse_id: warehouseId },
        cache: "no-store",
      })
      // The cookie below still holds the choice for this browser.
      .catch(() => null)
  }

  await writeWarehouseCookie(warehouseId)
}

const writeWarehouseCookie = async (warehouseId: string) => {
  const cookies = await nextCookies()

  cookies.set(WAREHOUSE_COOKIE, warehouseId, {
    maxAge: WAREHOUSE_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

/**
 * The warehouse the current request is served from: the buyer's choice in
 * this browser, else the one saved on their account, else the default.
 *
 * Use `getActiveWarehouse` (lib/data/active-warehouse) in components rather
 * than calling this directly, so the header, the listing and its note all get
 * the same answer from a single lookup per request.
 */
export const resolveWarehouse = async (): Promise<ActiveWarehouse | null> => {
  const warehouses = await listWarehouses()

  if (!warehouses.length) {
    return null
  }

  const selectedId = await getSelectedWarehouseId()
  const fromCookie = warehouses.find((warehouse) => warehouse.id === selectedId)

  if (fromCookie) {
    return { warehouse: fromCookie, warehouses, chosen: true }
  }

  // No choice in this browser yet. A signed-in buyer may have one saved
  // against their customer record from another device.
  if ((await getAuthHeaders()).authorization) {
    const location = await fetchLocation()
    const fromAccount =
      location?.resolved_from === "saved"
        ? warehouses.find((warehouse) => warehouse.id === location.warehouse_id)
        : undefined

    if (fromAccount) {
      return { warehouse: fromAccount, warehouses, chosen: true }
    }
  }

  return { warehouse: defaultWarehouse(warehouses), warehouses, chosen: false }
}

// Mirrors the backend's `defaultWarehouse` in src/lib/warehouses.ts.
function defaultWarehouse(warehouses: Warehouse[]): Warehouse {
  return warehouses.find((warehouse) => warehouse.is_default) ?? warehouses[0]
}

/**
 * Asks the backend which warehouse is in force, without sending coordinates.
 *
 * Returns the buyer's saved preference when they are signed in, otherwise the
 * configured default.
 */
const fetchLocation = async (): Promise<StoreLocation | null> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{ location: StoreLocation }>("/store/location", {
      method: "GET",
      headers,
      // Runs on every page for a signed-in buyer with no warehouse cookie.
      // Keyed by their auth header; a change made in this browser is written
      // to the cookie, which wins over this, so only a choice made on another
      // device waits out the minute.
      next: { revalidate: 60 },
    })
    .then(({ location }) => location)
    .catch(() => null)
}

/**
 * Sends a browser coordinate to the backend and remembers what came back.
 *
 * The matching itself lives in the backend (`/store/location`) so there is one
 * implementation rather than two that can drift apart.
 */
export const selectNearestWarehouse = async (
  lat: number,
  lng: number
): Promise<Warehouse | null> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  // The backend owns the matching, and persists the result against the
  // customer when one is signed in. Auth headers are forwarded for that
  // reason: without them the resolution still works but is not remembered.
  const location = await sdk.client
    .fetch<{ location: StoreLocation }>("/store/location", {
      method: "POST",
      headers,
      body: { lat, lng },
      cache: "no-store",
    })
    .then(({ location }) => location)
    .catch(() => null)

  if (!location) {
    return null
  }

  // The cookie still holds the choice, so server rendering can read it
  // without a round trip on every request.
  await writeWarehouseCookie(location.warehouse_id)

  const warehouses = await listWarehouses()

  return warehouses.find((warehouse) => warehouse.id === location.warehouse_id) ?? null
}

/**
 * Whether each product is in stock at a warehouse, keyed by product id.
 * Asks in batches of the backend's limit, so any number of ids can be passed.
 */
export const getWarehouseAvailability = async (
  warehouseId: string,
  productIds: string[]
): Promise<AvailabilityMap> => {
  // Sorted, so the same set of products always makes the same requests and
  // hits the same cache entries.
  const ids = Array.from(new Set(productIds)).sort()

  if (!warehouseId || !ids.length) {
    return {}
  }

  const batches: string[][] = []
  for (let i = 0; i < ids.length; i += AVAILABILITY_IDS_PER_REQUEST) {
    batches.push(ids.slice(i, i + AVAILABILITY_IDS_PER_REQUEST))
  }

  // Approved buyers only; the auth header also keeps each buyer's cache apart.
  const headers = await getAuthHeaders()

  const maps = await Promise.all(
    batches.map((batch) =>
      sdk.client
        .fetch<{ availability: AvailabilityMap }>(
          "/store/warehouse-availability",
          {
            method: "GET",
            headers,
            query: {
              warehouse_id: warehouseId,
              product_ids: batch.join(","),
            },
            next: { revalidate: AVAILABILITY_MAX_AGE_SECONDS },
          }
        )
        .then(({ availability }) => availability ?? {})
        // Availability is decoration on top of the listing. If it fails the
        // buyer should still get products, not an error page.
        .catch((): AvailabilityMap => ({}))
    )
  )

  return Object.assign({}, ...maps)
}
