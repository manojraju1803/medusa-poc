"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import React from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  return (
    <div className="flex flex-col gap-y-6">
      {/* Header Bar with Back Link */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a]">
            Order #{order.display_id}
          </h1>
          <p className="text-xs text-[#64748b]">
            Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <LocalizedClientLink
          href="/account/orders"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#bbf7d0] text-xs font-semibold text-[#166534] transition-colors"
          data-testid="back-to-overview-button"
        >
          <span>←</span>
          <span>Back to All Orders</span>
        </LocalizedClientLink>
      </div>

      {/* Main Order Details Card */}
      <div
        className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs flex flex-col gap-6"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />

        <div className="pt-4 border-t border-gray-100">
          <h2 className="text-base font-bold text-[#0f172a] mb-4">
            Items in this Shipment
          </h2>
          <Items order={order} />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <ShippingDetails order={order} />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <OrderSummary order={order} />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <Help />
        </div>
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
