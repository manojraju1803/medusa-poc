import { convertToLocale } from "@lib/util/money"
import { minQuantityOf } from "@lib/util/min-quantity"
import { HttpTypes } from "@medusajs/types"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemsTemplateProps = {
  cart: HttpTypes.StoreCart
}

// Compact, read-only list of the cart lines for the checkout summary.
const ItemsPreviewTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = [...(cart.items ?? [])].sort((a, b) =>
    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  )
  const fmt = (amount: number) =>
    convertToLocale({ amount, currency_code: cart.currency_code })

  return (
    <div
      className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto"
      data-testid="items-table"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 py-3"
          data-testid="product-row"
        >
          <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-gray-100">
            <Thumbnail thumbnail={item.thumbnail} size="square" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-semibold text-[#0f172a] truncate"
              data-testid="product-title"
            >
              {item.product_title}
            </p>
            <p className="text-[11px] text-[#64748b]">
              {item.quantity} × {fmt(item.unit_price)}
              <span className="ml-1.5 text-[#9ca3af]">
                (MOQ {minQuantityOf(item.variant)})
              </span>
            </p>
          </div>
          <span className="text-sm font-bold text-[#4d7c0f]">
            {fmt(item.subtotal ?? item.unit_price * item.quantity)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default ItemsPreviewTemplate
