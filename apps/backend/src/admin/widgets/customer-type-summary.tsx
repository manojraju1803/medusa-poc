import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

type Group = { id: string; name: string; metadata?: Record<string, unknown> | null }

type Tile = {
  key: string
  label: string
  hint: string
  match: (g: Group) => boolean
}

// Buyer / R&D / Supplier groups are kept in sync with each customer's
// registration choice by the `customer-account-type-group` subscriber.
// Approved is set from the customer page.
const TILES: Tile[] = [
  { key: "buyer", label: "Buyers", hint: "Registered as Buyer", match: (g) => g.metadata?.ib_account_type === "buyer" },
  { key: "rnd", label: "R&D", hint: "Registered as R&D", match: (g) => g.metadata?.ib_account_type === "rnd" },
  { key: "supplier", label: "Suppliers", hint: "Registered as Supplier", match: (g) => g.metadata?.ib_account_type === "supplier" },
  { key: "approved", label: "Approved", hint: "Can see prices and order", match: (g) => g.name === "Approved" },
]

const countIn = (groupId: string) =>
  fetch(`/admin/customers?groups=${groupId}&limit=1&fields=id`, { credentials: "include" })
    .then((r) => r.json())
    .then((r: { count: number }) => r.count)

const CustomerTypeSummary = () => {
  const [tiles, setTiles] = useState<
    { tile: Tile; group?: Group; count: number | null }[]
  >(TILES.map((tile) => ({ tile, count: null })))
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [{ customer_groups }, all] = await Promise.all([
        fetch("/admin/customer-groups?limit=100&fields=id,name,metadata", {
          credentials: "include",
        }).then((r) => r.json() as Promise<{ customer_groups: Group[] }>),
        fetch("/admin/customers?limit=1&fields=id", { credentials: "include" })
          .then((r) => r.json() as Promise<{ count: number }>),
      ])
      const rows = await Promise.all(
        TILES.map(async (tile) => {
          const group = customer_groups.find(tile.match)
          return { tile, group, count: group ? await countIn(group.id) : 0 }
        })
      )
      if (!cancelled) {
        setTiles(rows)
        setTotal(all.count)
      }
    })().catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  const approved = tiles.find((t) => t.tile.key === "approved")?.count
  const pending =
    total !== null && approved !== null && approved !== undefined
      ? Math.max(total - approved, 0)
      : null

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Customer types</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Open a type to see its customers. To filter this list instead, use
            Add filter → Groups.
          </Text>
        </div>
        {pending !== null && (
          <Text size="small" className="text-ui-fg-subtle">
            {pending} awaiting approval
          </Text>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 px-6 py-4 md:grid-cols-4">
        {tiles.map(({ tile, group, count }) => {
          const body = (
            <>
              <Text size="small" className="text-ui-fg-subtle">
                {tile.label}
              </Text>
              <Text size="xlarge" weight="plus" className="tabular-nums">
                {count ?? "–"}
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted">
                {group ? tile.hint : "Group not created yet"}
              </Text>
            </>
          )
          const cls =
            "flex flex-col gap-y-1 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-3"
          return group ? (
            <Link
              key={tile.key}
              to={`/customer-groups/${group.id}`}
              className={`${cls} transition-colors hover:bg-ui-bg-base-hover`}
            >
              {body}
            </Link>
          ) : (
            <div key={tile.key} className={cls}>
              {body}
            </div>
          )
        })}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.list.before",
})

export default CustomerTypeSummary
