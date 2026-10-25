"use client"

import { setSelectedWarehouseId } from "@lib/data/warehouses"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Warehouse } from "types/warehouse"

export default function WarehousePills({
  warehouses,
  selectedId,
  hasChosen,
}: {
  warehouses: Warehouse[]
  selectedId?: string
  // False while the highlighted pill is only the default.
  hasChosen: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const select = (warehouseId: string) => {
    // Clicking the highlighted default still saves it as the buyer's choice.
    if (warehouseId === selectedId && hasChosen) {
      return
    }

    startTransition(async () => {
      await setSelectedWarehouseId(warehouseId)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="warehouse-filter">
      <span className="txt-compact-small text-ui-fg-subtle mr-1">
        Deliver from:
      </span>
      {warehouses.map((warehouse) => {
        const isSelected = warehouse.id === selectedId

        return (
          <button
            key={warehouse.id}
            type="button"
            onClick={() => select(warehouse.id)}
            disabled={isPending}
            aria-pressed={isSelected}
            data-testid="warehouse-option"
            data-selected={isSelected}
            className={[
              "txt-compact-small rounded-full border px-4 py-1.5 transition-colors",
              "disabled:opacity-60 disabled:cursor-wait",
              isSelected
                ? "border-ui-fg-base bg-ui-fg-base text-ui-bg-base"
                : "border-ui-border-base text-ui-fg-subtle hover:border-ui-fg-base hover:text-ui-fg-base",
            ].join(" ")}
          >
            {warehouse.city}
          </button>
        )
      })}
    </div>
  )
}
