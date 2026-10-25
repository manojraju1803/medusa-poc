import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import StatusBadge, { orderStatus } from "@modules/order/components/status-badge"
import Thumbnail from "@modules/products/components/thumbnail"

// The status count tiles live on the orders page itself, above this table.
const OrdersTable = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  const statuses = orders.map(orderStatus)

  if (!orders.length) {
    return (
      <div
        className="bg-white border border-gray-100 rounded-2xl shadow-sm py-16 text-center"
        data-testid="no-orders-container"
      >
        <h3 className="font-bold text-[#0f172a] mb-1">No orders yet</h3>
        <p className="text-sm text-[#64748b] mb-4">
          Orders you place will show up here.
        </p>
        <LocalizedClientLink
          href="/store"
          className="inline-block px-5 py-2.5 bg-[#4d7c0f] hover:bg-[#3f6212] text-white font-semibold text-sm rounded-xl"
        >
          Browse ingredients
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="orders-table">
            <thead className="bg-[#fafdf5] border-b border-gray-100">
              <tr>
                {["Order", "Product", "Date", "Qty", "Value", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-[#64748b] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order, i) => {
                const first = order.items?.[0]
                const more = (order.items?.length ?? 0) - 1
                const qty =
                  order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-[#fafdf5] transition-colors"
                    data-testid="order-row"
                  >
                    <td className="px-4 py-3 text-xs font-mono text-[#4d7c0f] font-semibold whitespace-nowrap">
                      #{order.display_id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                          <Thumbnail thumbnail={first?.thumbnail} size="square" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-xs font-medium text-[#0f172a] max-w-[180px] truncate">
                            {first?.product_title}
                          </span>
                          {more > 0 && (
                            <span className="text-[10px] text-[#64748b]">
                              + {more} more
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-[#374151]">
                      {qty}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-[#4d7c0f] whitespace-nowrap">
                      {convertToLocale({
                        amount: order.total,
                        currency_code: order.currency_code,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={statuses[i]} />
                    </td>
                    <td className="px-4 py-3">
                      <LocalizedClientLink
                        href={`/account/orders/details/${order.id}`}
                        className="px-3 py-1.5 text-[11px] font-semibold border border-[#4d7c0f]/40 text-[#4d7c0f] rounded-lg hover:bg-[#f6fbee] transition-colors whitespace-nowrap"
                        data-testid="order-details-link"
                      >
                        View details
                      </LocalizedClientLink>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default OrdersTable
