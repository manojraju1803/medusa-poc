import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  Heading,
  Select,
  Skeleton,
  Table,
  Text,
  useDataTable,
} from "@medusajs/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

type Range = "7d" | "30d" | "90d" | "12m"

const RANGES: { value: Range; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
]

type Trends = {
  granularity: "day" | "month"
  currency_code: string
  other_currency_orders: number
  buckets: { key: string; orders: number; sales: number }[]
  totals: { orders: number; sales: number; average_order: number }
  top_products: {
    product_key: string
    title: string
    quantity: number
    orders: number
    sales: number
  }[]
  top_customers: {
    customer_key: string
    name: string
    email: string | null
    orders: number
    sales: number
  }[]
}

type Activity = {
  pending_approvals: number
  // null until the admin creates the Unapproved customer group.
  unapproved_group_id: string | null
  new_inquiries: {
    total: number
    by_type: { quote_sample: number; contact: number; supplier_registration: number }
  }
  low_stock: {
    warehouses: string[]
    count: number
  }
}

type LowStockRow = {
  inventory_item_id: string
  title: string
  sku: string | null
  warehouse: string
  available: number
  threshold: number
  // Where the threshold came from: the item's own number for that warehouse,
  // the warehouse's default, or the standard 10.
  threshold_source: "item" | "warehouse" | "standard"
}

type LowStockPage = {
  rows: LowStockRow[]
  // Rows in total, for paging; an item low at two warehouses has two rows.
  count: number
}

// Same-origin requests carry the admin's session cookie, as on the Inquiries page.
async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Couldn't load ${url} (${response.status})`)
  }
  return response.json()
}

// The admin reuses anything loaded in the last 90 seconds. Stock and orders
// change on other pages, so load this page's numbers again each time it opens.
const LOAD_ON_OPEN = { refetchOnMount: "always" } as const

const money =(amount: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount)

const count = (value: number) => new Intl.NumberFormat("en-IN").format(value)

// Bucket keys are India-time dates (YYYY-MM-DD) or months (YYYY-MM).
const bucketLabel = (key: string, granularity: Trends["granularity"]) =>
  granularity === "day"
    ? new Date(`${key}T00:00:00Z`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      })
    : new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      })

const TrendsPage = () => {
  const [range, setRange] = useState<Range>("30d")

  const trends = useQuery({
    queryKey: ["monitoring", "trends", range],
    queryFn: () => getJson<Trends>(`/admin/monitoring/trends?range=${range}`),
    ...LOAD_ON_OPEN,
  })
  const activity = useQuery({
    queryKey: ["monitoring", "activity"],
    queryFn: () => getJson<Activity>("/admin/monitoring/activity"),
    ...LOAD_ON_OPEN,
  })

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex flex-col gap-y-1 px-6 py-4">
        <Heading level="h1">Trends</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          What needs attention now, and how orders and sales are going.
        </Text>
      </Container>

      <ActivityTiles activity={activity.data} isError={activity.isError} />

      {/* The range applies to the charts and the top lists below it. */}
      <Container className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <Heading level="h2">Orders and sales</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Placed orders, excluding drafts and cancellations, at their full
            total with GST. Days follow India time.
          </Text>
        </div>
        <Select value={range} onValueChange={(value) => setRange(value as Range)}>
          <Select.Trigger className="w-44">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {RANGES.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </Container>
      <OrdersAndSales trends={trends.data} isError={trends.isError} />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <TopProducts trends={trends.data} />
        <TopCustomers trends={trends.data} />
      </div>

      <LowStock />
    </div>
  )
}

const Tile = ({
  label,
  value,
  detail,
  link,
}: {
  label: string
  value: number | undefined
  detail: string
  link?: { to: string; text: string }
}) => (
  <Container className="flex flex-col gap-y-2 px-6 py-4">
    <Text size="small" leading="compact" weight="plus" className="text-ui-fg-subtle">
      {label}
    </Text>
    {value === undefined ? (
      <Skeleton className="h-8 w-16" />
    ) : (
      <Text className="text-3xl font-semibold tabular-nums">{count(value)}</Text>
    )}
    <Text size="small" className="text-ui-fg-subtle">
      {detail}
    </Text>
    {link && (
      <Link to={link.to} className="text-ui-fg-interactive txt-compact-small hover:underline">
        {link.text}
      </Link>
    )}
  </Container>
)

const ActivityTiles = ({
  activity,
  isError,
}: {
  activity?: Activity
  isError: boolean
}) => {
  if (isError) {
    return (
      <Container className="px-6 py-4">
        <Text size="small" className="text-ui-fg-error">
          Couldn't load the activity counts. Refresh the page to try again.
        </Text>
      </Container>
    )
  }

  const inquiries = activity?.new_inquiries.by_type
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Tile
        label="Pending approvals"
        value={activity?.pending_approvals}
        detail="Registered accounts not yet approved to see prices"
        link={
          activity?.unapproved_group_id
            ? {
                to: `/customer-groups/${activity.unapproved_group_id}`,
                text: "Review unapproved customers",
              }
            : { to: "/customers", text: "Review customers" }
        }
      />
      <Tile
        label="New inquiries"
        value={activity?.new_inquiries.total}
        detail={
          inquiries
            ? `Quote / sample ${inquiries.quote_sample} · Contact ${inquiries.contact} · Supplier ${inquiries.supplier_registration}`
            : "Quote / sample, contact and supplier requests"
        }
        link={{ to: "/inquiries", text: "Open inquiries" }}
      />
      <Tile
        label="Low stock"
        value={activity?.low_stock.count}
        detail={
          activity
            ? `Items at or below their threshold in ${
                activity.low_stock.warehouses.join(", ") || "no selling warehouse"
              }`
            : "Items at or below their threshold"
        }
      />
    </div>
  )
}

const OrdersAndSales = ({ trends, isError }: { trends?: Trends; isError: boolean }) => {
  if (isError) {
    return (
      <Container className="px-6 py-4">
        <Text size="small" className="text-ui-fg-error">
          Couldn't load the trends. Refresh the page to try again.
        </Text>
      </Container>
    )
  }

  const currency = trends?.currency_code ?? "inr"
  const otherCurrency = trends?.other_currency_orders ?? 0

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      <TrendChart
        title="Orders"
        trends={trends}
        stats={[{ label: "Orders placed", value: trends && count(trends.totals.orders) }]}
        valueOf={(bucket) => bucket.orders}
        describe={(value) => `${count(value)} order${value === 1 ? "" : "s"}`}
      />
      <TrendChart
        title="Sales"
        trends={trends}
        stats={[
          { label: "Sales", value: trends && money(trends.totals.sales, currency) },
          { label: "Average order", value: trends && money(trends.totals.average_order, currency) },
        ]}
        valueOf={(bucket) => bucket.sales}
        describe={(value) => money(value, currency)}
        note={
          otherCurrency
            ? `${otherCurrency} order${otherCurrency === 1 ? "" : "s"} in other currencies aren't included.`
            : undefined
        }
      />
    </div>
  )
}

// One measure per period as bars, with the totals for the whole range above.
const TrendChart = ({
  title,
  trends,
  stats,
  valueOf,
  describe,
  note,
}: {
  title: string
  trends?: Trends
  stats: { label: string; value: string | undefined }[]
  valueOf: (bucket: Trends["buckets"][number]) => number
  describe: (value: number) => string
  note?: string
}) => {
  const max = Math.max(1, ...(trends?.buckets ?? []).map(valueOf))
  const labelEvery = Math.max(1, Math.ceil((trends?.buckets.length ?? 1) / 8))

  return (
    <Container className="flex flex-col gap-y-4 px-6 py-4">
      <Text size="small" leading="compact" weight="plus">
        {title}
      </Text>

      <div className="flex flex-wrap gap-x-10 gap-y-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-y-1">
            <Text size="small" className="text-ui-fg-subtle">
              {stat.label}
            </Text>
            {stat.value === undefined ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <Text className="text-xl font-semibold tabular-nums">{stat.value}</Text>
            )}
          </div>
        ))}
      </div>

      {!trends ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div>
          <div
            className="flex h-40 items-end gap-[2px] border-b border-ui-border-base"
            role="img"
            aria-label={`${title} per period`}
          >
            {trends.buckets.map((bucket) => {
              const value = valueOf(bucket)
              return (
                <div
                  key={bucket.key}
                  className="flex h-full flex-1 items-end"
                  title={`${bucketLabel(bucket.key, trends.granularity)}: ${describe(value)}`}
                >
                  <div
                    className="w-full rounded-t-sm bg-ui-fg-interactive"
                    style={{ height: value ? `${Math.max(2, (value / max) * 100)}%` : 0 }}
                  />
                </div>
              )
            })}
          </div>
          <div className="mt-1 flex gap-[2px]">
            {trends.buckets.map((bucket, index) => (
              <div key={bucket.key} className="flex-1 overflow-visible whitespace-nowrap">
                {(index % labelEvery === 0 || index === trends.buckets.length - 1) && (
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {bucketLabel(bucket.key, trends.granularity)}
                  </Text>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {note && (
        <Text size="small" className="text-ui-fg-subtle">
          {note}
        </Text>
      )}
    </Container>
  )
}

const TopProducts = ({ trends }: { trends?: Trends }) => (
  <Container className="flex flex-col gap-y-3 px-6 py-4">
    <Text size="small" leading="compact" weight="plus">
      Top products by sales
    </Text>
    {!trends ? (
      <Skeleton className="h-32 w-full" />
    ) : !trends.top_products.length ? (
      <Text size="small" className="text-ui-fg-subtle">
        No orders in this period.
      </Text>
    ) : (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Product</Table.HeaderCell>
            <Table.HeaderCell className="text-right">Quantity</Table.HeaderCell>
            <Table.HeaderCell className="text-right">Orders</Table.HeaderCell>
            <Table.HeaderCell className="text-right">Sales</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {trends.top_products.map((product) => (
            <Table.Row key={product.product_key}>
              <Table.Cell className="max-w-[260px] truncate">{product.title}</Table.Cell>
              <Table.Cell className="text-right tabular-nums">{count(product.quantity)}</Table.Cell>
              <Table.Cell className="text-right tabular-nums">{count(product.orders)}</Table.Cell>
              <Table.Cell className="text-right tabular-nums">
                {money(product.sales, trends.currency_code)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )}
  </Container>
)

const TopCustomers = ({ trends }: { trends?: Trends }) => (
  <Container className="flex flex-col gap-y-3 px-6 py-4">
    <Text size="small" leading="compact" weight="plus">
      Top customers by sales
    </Text>
    {!trends ? (
      <Skeleton className="h-32 w-full" />
    ) : !trends.top_customers.length ? (
      <Text size="small" className="text-ui-fg-subtle">
        No orders in this period.
      </Text>
    ) : (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Customer</Table.HeaderCell>
            <Table.HeaderCell className="text-right">Orders</Table.HeaderCell>
            <Table.HeaderCell className="text-right">Sales</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {trends.top_customers.map((customer) => (
            <Table.Row key={customer.customer_key}>
              <Table.Cell className="max-w-[260px]">
                <div className="flex flex-col">
                  <Text size="small" className="truncate">
                    {customer.name}
                  </Text>
                  {customer.email && customer.email !== customer.name && (
                    <Text size="xsmall" className="truncate text-ui-fg-subtle">
                      {customer.email}
                    </Text>
                  )}
                </div>
              </Table.Cell>
              <Table.Cell className="text-right tabular-nums">{count(customer.orders)}</Table.Cell>
              <Table.Cell className="text-right tabular-nums">
                {money(customer.sales, trends.currency_code)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )}
  </Container>
)

const LOW_STOCK_PAGE_SIZE = 20

const lowStockColumn = createDataTableColumnHelper<LowStockRow>()

const lowStockColumns = [
  lowStockColumn.accessor("title", {
    header: "Product",
    cell: ({ getValue }) => <span className="block max-w-[280px] truncate">{getValue()}</span>,
  }),
  lowStockColumn.accessor("sku", {
    header: "SKU",
    cell: ({ getValue }) => (
      <span className="block max-w-[200px] truncate text-ui-fg-subtle">{getValue() ?? "—"}</span>
    ),
  }),
  lowStockColumn.accessor("warehouse", { header: "Warehouse" }),
  lowStockColumn.accessor("available", {
    header: "Available",
    cell: ({ getValue }) => <span className="tabular-nums">{count(getValue())}</span>,
  }),
  lowStockColumn.accessor("threshold", {
    header: "Threshold",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {count(row.original.threshold)}
        <span className="ml-1 text-ui-fg-muted">
          ({row.original.threshold_source})
        </span>
      </span>
    ),
  }),
]

const LowStock = () => {
  const navigate = useNavigate()
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: LOW_STOCK_PAGE_SIZE,
  })
  const offset = pagination.pageIndex * pagination.pageSize

  const lowStock = useQuery({
    queryKey: ["monitoring", "low-stock", offset, pagination.pageSize],
    queryFn: () =>
      getJson<LowStockPage>(
        `/admin/monitoring/low-stock?offset=${offset}&limit=${pagination.pageSize}`
      ),
    // Keeps the current page on screen while the next one loads.
    placeholderData: keepPreviousData,
    ...LOAD_ON_OPEN,
  })
  const page = lowStock.data

  const table = useDataTable({
    data: page?.rows ?? [],
    columns: lowStockColumns,
    getRowId: (row) => `${row.inventory_item_id}:${row.warehouse}`,
    rowCount: page?.count ?? 0,
    isLoading: lowStock.isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    // The item's page has the Low-stock alert box for its own thresholds.
    onRowClick: (_, row) => navigate(`/inventory/${row.inventory_item_id}`),
  })

  return (
    <Container className="flex flex-col overflow-hidden p-0">
      <div className="flex flex-col gap-y-1 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Low stock
        </Text>
        <Text size="small" className="max-w-2xl text-ui-fg-subtle">
          Stock left after reservations, checked at each warehouse that sells
          to the store. Each warehouse has its own default, set on its page
          under Settings → Locations &amp; Shipping. Click an item to give it
          its own number at a warehouse.
        </Text>
      </div>

      {lowStock.isError ? (
        <Text size="small" className="px-6 pb-4 text-ui-fg-error">
          Couldn't load the low-stock items. Refresh the page to try again.
        </Text>
      ) : page && page.count === 0 ? (
        <Text size="small" className="px-6 pb-4 text-ui-fg-subtle">
          Nothing is at or below its threshold.
        </Text>
      ) : (
        <DataTable instance={table}>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Trends",
})

export default TrendsPage
