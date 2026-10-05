import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { listOrders } from "@lib/data/orders"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

export const metadata: Metadata = {
  title: "Purchase Orders & Tax Invoices | IngredientsBazar",
  description: "Overview of your previous industrial ingredient orders, delivery tracking, and GST invoices.",
}

export default async function Orders() {
  const orders = (await listOrders().catch(() => [])) || []

  return (
    <div className="w-full flex flex-col gap-8" data-testid="orders-page-wrapper">
      <div className="flex flex-col gap-1 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-[#0f172a]">
          Purchase Orders & Tax Invoices
        </h1>
        <p className="text-xs text-[#64748b]">
          Track fulfillment status, download commercial tax invoices, and monitor logistics dispatches in real-time.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <OrderOverview orders={orders} />
        <TransferRequestForm />
      </div>
    </div>
  )
}
