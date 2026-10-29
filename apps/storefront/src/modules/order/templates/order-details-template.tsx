import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OrderView from "@modules/order/components/order-view"
import React from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
  metadata?: Record<string, unknown> | null
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
  metadata,
}) => {
  return (
    <div className="flex flex-col gap-y-4" data-testid="order-details-container">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl font-extrabold text-[#0f172a]">Order details</h1>
        <LocalizedClientLink
          href="/account/orders"
          className="flex gap-1.5 items-center text-sm font-semibold text-[#0757a8] hover:underline"
          data-testid="back-to-overview-button"
        >
          ← Back to orders
        </LocalizedClientLink>
      </div>
      <OrderView order={order} metadata={metadata} />
    </div>
  )
}

export default OrderDetailsTemplate
