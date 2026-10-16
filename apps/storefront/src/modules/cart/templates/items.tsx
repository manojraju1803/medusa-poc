import { HttpTypes } from "@medusajs/types"

import Item from "@modules/cart/components/item"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { VariantPriceTiers } from "types/global"

type ItemsTemplateProps = {
  cart: HttpTypes.StoreCart
  priceTiers?: VariantPriceTiers[]
}

const ItemsTemplate = ({ cart, priceTiers }: ItemsTemplateProps) => {
  const items = [...(cart.items ?? [])].sort((a, b) =>
    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  )

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#f8fffe]">
        <h2 className="text-base font-bold text-[#0f172a]">
          Cart Items{" "}
          <span className="text-[#64748b] font-normal text-sm">
            ({items.length})
          </span>
        </h2>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((item) => (
          <Item
            key={item.id}
            item={item}
            currencyCode={cart.currency_code}
            priceTiers={priceTiers?.find(
              (tiers) => tiers.variant_id === item.variant_id
            )}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 bg-[#f8fffe] border-t border-gray-100">
        <LocalizedClientLink
          href="/store"
          className="flex items-center gap-1.5 px-4 py-2 border border-[#006B4F]/40 text-[#006B4F] text-sm font-semibold rounded-xl hover:bg-[#f0fdf4] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Continue Shopping
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default ItemsTemplate
