import { Metadata } from "next"

import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import TransferRequestForm from "@modules/account/components/transfer-request-form"
import OrdersTable from "@modules/order/components/orders-table"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  const orders = await listOrders(50)

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-6 flex flex-col gap-y-1">
        <h1 className="text-2xl font-extrabold text-[#0f172a]">My Orders</h1>
        <p className="text-sm text-[#64748b]">
          Track and manage your ingredient orders.
        </p>
      </div>
      <OrdersTable orders={orders} />
      <div className="mt-10 pt-8 border-t border-gray-100">
        <TransferRequestForm />
      </div>
    </div>
  )
}
