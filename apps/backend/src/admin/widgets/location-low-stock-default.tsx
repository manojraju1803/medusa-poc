import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Input, Label, Skeleton, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import {
  FALLBACK_LOW_STOCK_THRESHOLD,
  LOW_STOCK_THRESHOLD_KEY,
  readThreshold,
} from "../../api/utils/monitoring"

type Location = {
  id: string
  metadata: Record<string, unknown> | null
  sales_channels?: { id: string }[] | null
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
 * Sets this warehouse's default low-stock threshold, used for every item here
 * that has no number of its own. Saves through Medusa's own stock location
 * endpoint, into the warehouse's metadata.
 */
const LocationLowStockDefaultWidget = ({ data }: { data: { id: string } }) => {
  const queryClient = useQueryClient()

  const location = useQuery({
    queryKey: ["monitoring", "stock-location", data.id],
    queryFn: () =>
      getJson<{ stock_location: Location }>(
        `/admin/stock-locations/${data.id}?fields=id,metadata,sales_channels.id`
      ),
  })

  const metadata = location.data?.stock_location.metadata ?? null
  const current = readThreshold(metadata?.[LOW_STOCK_THRESHOLD_KEY])
  const sells = (location.data?.stock_location.sales_channels ?? []).length > 0

  const [value, setValue] = useState("")
  useEffect(() => {
    setValue(current === null ? "" : String(current))
  }, [current])

  const save = useMutation({
    // `null` goes back to the standard threshold. Medusa deletes a metadata
    // key whose value is an empty string; the rest of the metadata is kept.
    mutationFn: async (threshold: number | null) => {
      const response = await fetch(`/admin/stock-locations/${data.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: { ...(metadata ?? {}), [LOW_STOCK_THRESHOLD_KEY]: threshold ?? "" },
        }),
      })
      if (!response.ok) {
        throw new Error("The default wasn't saved.")
      }
    },
    onSuccess: (_, threshold) => {
      // Ours, the Trends page, item pages, and the page's own Metadata section.
      queryClient.invalidateQueries({ queryKey: ["monitoring"] })
      queryClient.invalidateQueries({ queryKey: ["stock_locations"] })
      toast.success(
        threshold === null
          ? `This warehouse now uses the standard ${FALLBACK_LOW_STOCK_THRESHOLD}`
          : "Low-stock default saved"
      )
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const parsed = Number(value)
  const valid = value !== "" && Number.isInteger(parsed) && parsed >= 0

  return (
    <Container className="flex flex-col gap-y-3 px-6 py-4">
      <div className="flex flex-col gap-y-1">
        <Text size="small" leading="compact" weight="plus">
          Low-stock default
        </Text>
        <Text size="small" className="text-ui-fg-subtle">
          Items here are flagged on the Trends page when their stock left is at
          or below this number, unless an item has its own number for this
          warehouse.
        </Text>
      </div>

      {location.isLoading ? (
        <Skeleton className="h-8 w-full" />
      ) : location.isError ? (
        <Text size="small" className="text-ui-fg-error">
          Couldn't load this warehouse. Refresh the page to try again.
        </Text>
      ) : (
        <>
          {!sells && (
            <Text size="small" className="text-ui-fg-subtle">
              This warehouse isn't linked to a sales channel, so its stock isn't
              checked for low stock.
            </Text>
          )}
          <Text size="small" className="text-ui-fg-subtle">
            {current === null
              ? `Uses the standard default: ${FALLBACK_LOW_STOCK_THRESHOLD}.`
              : `Default for this warehouse: ${current}.`}
          </Text>
          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (valid) {
                save.mutate(parsed)
              }
            }}
          >
            <div className="flex flex-1 flex-col gap-y-1">
              <Label htmlFor="location-low-stock-default" size="small">
                Default threshold
              </Label>
              <Input
                id="location-low-stock-default"
                type="number"
                min={0}
                step={1}
                size="small"
                placeholder={String(FALLBACK_LOW_STOCK_THRESHOLD)}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                disabled={save.isPending}
              />
            </div>
            <Button
              type="submit"
              size="small"
              disabled={!valid || parsed === current}
              isLoading={save.isPending && save.variables !== null}
            >
              Save
            </Button>
          </form>
          {current !== null && (
            <Button
              type="button"
              size="small"
              variant="secondary"
              className="self-start"
              onClick={() => save.mutate(null)}
              disabled={save.isPending}
              isLoading={save.isPending && save.variables === null}
            >
              Use standard ({FALLBACK_LOW_STOCK_THRESHOLD})
            </Button>
          )}
        </>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "location.details.side",
})

export default LocationLowStockDefaultWidget
