"use client"

import { Button } from "@modules/common/components/ui"
import OrderCard from "../order-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {orders.map((o) => (
          <div key={o.id}>
            <OrderCard order={o} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="w-full flex flex-col items-center justify-center p-10 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center gap-4"
      data-testid="no-orders-container"
    >
      <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-2xl shadow-xs">
        📦
      </div>
      <div className="flex flex-col">
        <h2 className="text-base font-bold text-[#0f172a]">No purchase orders found</h2>
        <p className="text-xs text-[#64748b] mt-1 max-w-sm">
          You haven&apos;t placed any wholesale ingredient orders yet. Explore our verified manufacturer catalog to request quotes or purchase directly.
        </p>
      </div>
      <div className="mt-2">
        <LocalizedClientLink href="/store" passHref>
          <Button
            data-testid="continue-shopping-button"
            className="bg-[#1C94D2] hover:bg-[#0284c7] text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-all"
          >
            Explore Ingredient Catalog →
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderOverview
