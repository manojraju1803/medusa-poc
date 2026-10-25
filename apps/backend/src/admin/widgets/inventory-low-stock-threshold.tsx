import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Input, Skeleton, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import {
  ITEM_THRESHOLDS_KEY,
  readItemThresholds,
  readThreshold,
} from "../../api/utils/monitoring"

type Metadata = Record<string, unknown> | null

type Item = {
  id: string
  metadata: Metadata
  location_levels?:
    | {
        location_id: string
        stocked_quantity: number
        reserved_quantity: number
      }[]
    | null
}

type Warehouses = {
  warehouses: { id: string; name: string; default_threshold: number | null }[]
  fallback_threshold: number
}

// Same-origin requests carry the admin's session cookie, as on the Trends page.
async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Couldn't load ${url} (${response.status})`)
  }
  return response.json()
}

/**
 * Sets this item's own low-stock threshold at each warehouse that sells to
 * the store. A warehouse left empty uses its own default. Saves through
 * Medusa's own inventory endpoint, into the item's metadata.
 *
 * Reads the stock and thresholds from the item the page loaded, which Medusa
 * reloads after every stock edit, so the numbers here never fall behind it.
 */
const InventoryLowStockThresholdWidget = ({ data }: { data: Item }) => {
  const queryClient = useQueryClient()

  const warehouses = useQuery({
    queryKey: ["monitoring", "warehouses"],
    queryFn: () => getJson<Warehouses>("/admin/monitoring/warehouses"),
  })

  const metadata = data.metadata ?? null
  const saved = useMemo(() => readItemThresholds(metadata), [metadata])

  // Only warehouses that sell and hold this item: elsewhere a threshold
  // would never be checked.
  const levels = data.location_levels
  const rows = useMemo(() => {
    return (warehouses.data?.warehouses ?? []).flatMap((warehouse) => {
      const level = (levels ?? []).find((l) => l.location_id === warehouse.id)
      if (!level) {
        return []
      }
      return [
        {
          ...warehouse,
          available: (Number(level.stocked_quantity) || 0) - (Number(level.reserved_quantity) || 0),
          fallback: warehouse.default_threshold ?? warehouses.data!.fallback_threshold,
        },
      ]
    })
  }, [levels, warehouses.data])

  const [values, setValues] = useState<Record<string, string>>({})
  useEffect(() => {
    setValues(
      Object.fromEntries(
        rows.map((row) => [row.id, saved[row.id] === undefined ? "" : String(saved[row.id])])
      )
    )
  }, [rows, saved])

  const invalid = rows.some((row) => {
    const value = values[row.id] ?? ""
    return value !== "" && readThreshold(value) === null
  })
  const changed = rows.some((row) => {
    const value = values[row.id] ?? ""
    return (value === "" ? undefined : Number(value)) !== saved[row.id]
  })

  const save = useMutation({
    mutationFn: async () => {
      // Keep numbers for warehouses not shown here (e.g. not selling right now).
      const thresholds: Record<string, number> = { ...saved }
      for (const row of rows) {
        const threshold = readThreshold(values[row.id])
        if (threshold === null) {
          delete thresholds[row.id]
        } else {
          thresholds[row.id] = threshold
        }
      }
      const response = await fetch(`/admin/inventory-items/${data.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...(metadata ?? {}),
            // Medusa deletes a metadata key whose value is an empty string.
            [ITEM_THRESHOLDS_KEY]: Object.keys(thresholds).length ? thresholds : "",
          },
        }),
      })
      if (!response.ok) {
        throw new Error("The thresholds weren't saved.")
      }
    },
    onSuccess: () => {
      // The Trends page, and the page's item: this widget and its Metadata
      // section read the saved thresholds from it.
      queryClient.invalidateQueries({ queryKey: ["monitoring"] })
      queryClient.invalidateQueries({ queryKey: ["inventory_items"] })
      toast.success("Low-stock thresholds saved")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const loading = warehouses.isLoading

  return (
    <Container className="flex flex-col gap-y-3 px-6 py-4">
      <div className="flex flex-col gap-y-1">
        <Text size="small" leading="compact" weight="plus">
          Low-stock alert
        </Text>
        <Text size="small" className="text-ui-fg-subtle">
          The Trends page flags this item at a warehouse when its stock left
          there is at or below the threshold. Leave a box empty to use that
          warehouse's default.
        </Text>
      </div>

      {loading ? (
        <Skeleton className="h-16 w-full" />
      ) : warehouses.isError ? (
        <Text size="small" className="text-ui-fg-error">
          Couldn't load the warehouses. Refresh the page to try again.
        </Text>
      ) : !rows.length ? (
        <Text size="small" className="text-ui-fg-subtle">
          This item isn't stocked at any warehouse that sells to the store.
        </Text>
      ) : (
        <form
          className="flex flex-col gap-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            if (!invalid && changed) {
              save.mutate()
            }
          }}
        >
          {rows.map((row) => {
            const value = values[row.id] ?? ""
            const threshold = readThreshold(value) ?? row.fallback
            return (
              <div key={row.id} className="flex flex-col gap-y-1">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor={`low-stock-${row.id}`}
                    className="txt-compact-small-plus truncate"
                  >
                    {row.name}
                  </label>
                  {row.available <= threshold && (
                    <Badge size="2xsmall" color="orange">
                      Low
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id={`low-stock-${row.id}`}
                    type="number"
                    min={0}
                    step={1}
                    size="small"
                    className="w-28"
                    placeholder={String(row.fallback)}
                    value={value}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [row.id]: event.target.value }))
                    }
                    disabled={save.isPending}
                  />
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {row.available} left ·{" "}
                    {value === ""
                      ? `warehouse default ${row.fallback}`
                      : "own threshold"}
                  </Text>
                </div>
              </div>
            )
          })}
          <Button
            type="submit"
            size="small"
            className="self-start"
            disabled={invalid || !changed}
            isLoading={save.isPending}
          >
            Save
          </Button>
        </form>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "inventory_item.details.side",
})

export default InventoryLowStockThresholdWidget
