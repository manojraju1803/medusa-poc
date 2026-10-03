"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listRegions = async () => {
  try {
    const next = {
      ...(await getCacheOptions("regions")),
    }

    return await sdk.client
      .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
        method: "GET",
        next,
        cache: "force-cache",
      })
      .then(({ regions }) => regions && regions.length > 0 ? regions : [
        {
          id: "reg_01JM_IN",
          name: "India",
          currency_code: "inr",
          countries: [{ id: "c_in", iso_2: "in", display_name: "India" }],
        } as any
      ])
      .catch(() => [
        {
          id: "reg_01JM_IN",
          name: "India",
          currency_code: "inr",
          countries: [{ id: "c_in", iso_2: "in", display_name: "India" }],
        } as any
      ])
  } catch {
    return [
      {
        id: "reg_01JM_IN",
        name: "India",
        currency_code: "inr",
        countries: [{ id: "c_in", iso_2: "in", display_name: "India" }],
      } as any
    ]
  }
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return await sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ region }) => region)
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  if (regionMap.has(countryCode)) {
    return regionMap.get(countryCode)
  }

  const regions = await listRegions()

  if (!regions) {
    return null
  }

  regions.forEach((region: HttpTypes.StoreRegion) => {
    region.countries?.forEach((c: HttpTypes.StoreRegionCountry | any) => {
      regionMap.set(c?.iso_2?.toLowerCase() ?? "", region)
    })
  })

  const region = countryCode
    ? regionMap.get(countryCode)
    : regionMap.get("us")

  return region
}
