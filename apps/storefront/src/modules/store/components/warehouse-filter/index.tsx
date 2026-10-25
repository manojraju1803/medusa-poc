import { getActiveWarehouse } from "@lib/data/active-warehouse"
import { Warehouse } from "types/warehouse"

import WarehousePills from "./pills"

/**
 * Orders the options outward from the default warehouse.
 *
 * Anchoring on the default rather than the current selection keeps the buttons
 * in a fixed order, so they do not reshuffle under the buyer's cursor when one
 * is clicked. With no coordinates to compare it falls back to the given order.
 */
function orderByProximityToDefault(warehouses: Warehouse[]): Warehouse[] {
  const anchor =
    warehouses.find((warehouse) => warehouse.is_default) ?? warehouses[0]

  if (!anchor) {
    return warehouses
  }

  return [...warehouses].sort(
    (a, b) => squaredDistance(anchor, a) - squaredDistance(anchor, b)
  )
}

/**
 * Comparison-only proximity. Skips the square root and the great-circle
 * correction because the result is never shown, only sorted on.
 */
function squaredDistance(from: Warehouse, to: Warehouse): number {
  return (from.lat - to.lat) ** 2 + (from.lng - to.lng) ** 2
}

/**
 * Which warehouse the listing below shows stock from, and the pills to switch
 * it. Reads the same active warehouse as the listing and the header.
 */
export default async function WarehouseFilter() {
  const active = await getActiveWarehouse()

  if (!active) {
    return null
  }

  const { warehouse, warehouses, chosen } = active

  return (
    <div className="flex flex-col gap-y-3 mb-6">
      {warehouses.length > 1 && (
        <WarehousePills
          warehouses={orderByProximityToDefault(warehouses)}
          selectedId={warehouse.id}
          hasChosen={chosen}
        />
      )}
      <p
        className="txt-compact-small text-ui-fg-subtle"
        data-testid="warehouse-note"
      >
        Showing stock from the {warehouse.city} warehouse
      </p>
    </div>
  )
}
