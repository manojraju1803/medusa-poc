import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"

type Item = {
  id: string
  location_levels?:
    | {
        location_id: string
        stocked_quantity: number
        reserved_quantity: number
        incoming_quantity: number
      }[]
    | null
}

/**
 * Refreshes the item page's Locations table after a stock level is edited or
 * deleted. Shows nothing.
 *
 * Medusa's admin (2.20.1, and still in 2.22.0) reloads the item after those
 * changes but not the table: `useUpdateInventoryLevel` and
 * `useDeleteInventoryItemLevel` invalidate an `inventory_item_levels`
 * "detail" key, while the table reads a "list" key. So the table kept its old
 * numbers until the page was reloaded. When the reloaded item's stock differs,
 * this refreshes the table with the key Medusa's own "Manage locations" uses.
 *
 * Remove this file once those two hooks in the dashboard's
 * `src/hooks/api/inventory.tsx` invalidate `inventoryItemLevelsQueryKeys.list`.
 */
const InventoryRefreshLocationsWidget = ({ data }: { data: Item }) => {
  const queryClient = useQueryClient()

  // Changes whenever any warehouse's numbers for this item change.
  const stock = (data.location_levels ?? [])
    .map((level) =>
      [
        level.location_id,
        level.stocked_quantity,
        level.reserved_quantity,
        level.incoming_quantity,
      ].join(":")
    )
    .sort()
    .join(",")

  const previous = useRef(stock)
  useEffect(() => {
    if (stock === previous.current) {
      return
    }
    previous.current = stock
    queryClient.invalidateQueries({
      queryKey: ["inventory_item_levels", "list", { query: { inventoryItemId: data.id } }],
    })
  }, [stock, data.id, queryClient])

  return null
}

export const config = defineWidgetConfig({
  zone: "inventory_item.details.after",
})

export default InventoryRefreshLocationsWidget
