"use client"

import {
  selectNearestWarehouse,
  setSelectedWarehouseId,
} from "@lib/data/warehouses"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { Warehouse } from "types/warehouse"

const GEOLOCATION_TIMEOUT_MS = 8000

export default function WarehouseSelect({
  warehouses,
  selectedId,
  hasChosen,
}: {
  warehouses: Warehouse[]
  selectedId?: string
  hasChosen: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [locating, setLocating] = useState(false)
  // Guards against the effect firing twice under React strict mode, which would
  // trigger two permission prompts.
  const askedRef = useRef(false)

  const apply = useCallback(
    (action: () => Promise<unknown>) => {
      startTransition(async () => {
        await action()
        router.refresh()
      })
    },
    [router]
  )

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return
    }

    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false)
        apply(() =>
          selectNearestWarehouse(
            position.coords.latitude,
            position.coords.longitude
          )
        )
      },
      // Denial is a normal outcome, not an error: the buyer just keeps using
      // the city picker below.
      () => setLocating(false),
      { timeout: GEOLOCATION_TIMEOUT_MS }
    )
  }, [apply])

  useEffect(() => {
    if (askedRef.current || hasChosen || !warehouses.length) {
      return
    }

    askedRef.current = true
    locate()
  }, [hasChosen, warehouses.length, locate])

  if (!warehouses.length) {
    return null
  }

  return (
    <div
      className="flex items-center gap-x-1"
      data-testid="warehouse-select"
      data-warehouse-id={selectedId}
    >
      <span aria-hidden="true">&#9679;</span>
      <label className="sr-only" htmlFor="warehouse-select-input">
        Delivering from
      </label>
      <select
        id="warehouse-select-input"
        className="bg-transparent outline-none cursor-pointer hover:text-ui-fg-base disabled:opacity-60"
        value={selectedId ?? ""}
        disabled={isPending || locating}
        onChange={(event) => apply(() => setSelectedWarehouseId(event.target.value))}
      >
        {warehouses.map((warehouse) => (
          <option key={warehouse.id} value={warehouse.id} className="text-black">
            {warehouse.city}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="underline hover:text-ui-fg-base disabled:opacity-60"
        onClick={locate}
        disabled={isPending || locating}
      >
        {locating ? "locating…" : "use my location"}
      </button>
    </div>
  )
}
