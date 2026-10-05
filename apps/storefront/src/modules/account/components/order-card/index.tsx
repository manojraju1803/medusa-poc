import { Button } from "@modules/common/components/ui"
import { useMemo } from "react"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  const formatStatus = (str: string = "") => {
    const formatted = str.split("_").join(" ")
    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col gap-4 hover:border-[#1C94D2] transition-colors"
      data-testid="order-card"
    >
      {/* Top Header Strip with ID, Date, and Badges */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#0f172a]">
            PO #{order.display_id}
          </span>
          <span
            className="text-xs text-[#64748b]"
            data-testid="order-created-at"
            suppressHydrationWarning
          >
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#166534] bg-[#dcfce7] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full">
            {formatStatus(order.fulfillment_status || "Processing")}
          </span>
          <span className="text-[10px] font-semibold text-[#1e40af] bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-0.5 rounded-full">
            {formatStatus(order.payment_status || "Paid")}
          </span>
        </div>
      </div>

      {/* Item Previews */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
        {order.items?.slice(0, 3).map((i) => {
          return (
            <div
              key={i.id}
              className="flex flex-col gap-y-1.5 p-2 rounded-xl bg-gray-50 border border-gray-100"
              data-testid="order-item"
            >
              <div className="aspect-square relative rounded-lg overflow-hidden bg-white p-1">
                <Thumbnail thumbnail={i.thumbnail} images={[]} size="full" />
              </div>
              <div className="flex flex-col text-xs">
                <span
                  className="font-semibold text-[#0f172a] truncate"
                  data-testid="item-title"
                >
                  {i.title}
                </span>
                <span className="text-[11px] text-[#64748b]">
                  Qty: {i.quantity}
                </span>
              </div>
            </div>
          )
        })}

        {numberOfProducts > 3 && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center p-2 text-xs text-[#64748b] font-medium">
            <span>+{numberOfLines - 3} more</span>
            <span>items</span>
          </div>
        )}
      </div>

      {/* Footer Total & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#64748b]">
            Total Commercial Amount
          </span>
          <span className="text-base font-extrabold text-[#0f172a]" data-testid="order-amount">
            {convertToLocale({
              amount: order.total,
              currency_code: order.currency_code,
            })}
          </span>
        </div>

        <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
          <Button
            data-testid="order-details-link"
            variant="secondary"
            className="h-9 px-4 text-xs font-semibold text-[#1C94D2] border-[#1C94D2] hover:bg-[#1C94D2] hover:text-white rounded-xl transition-all shadow-xs"
          >
            Track & View Details →
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderCard
