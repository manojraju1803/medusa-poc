import { Metadata } from "next"

import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import TransferRequestForm from "@modules/account/components/transfer-request-form"
import OrdersTable from "@modules/order/components/orders-table"
import {
  orderStatus,
  statusColor,
} from "@modules/order/components/status-badge"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  // Guests also render this slot; don't ask the API for their orders
  const customer = await retrieveCustomer().catch(() => null)
  const orders = customer ? await listOrders(50).catch(() => null) : null

  if (!orders) {
    notFound()
  }

  const statuses = orders.map(orderStatus)
  const count = (st: string) => statuses.filter((x) => x === st).length
  const summary = [
    { label: "Total Orders", val: orders.length, color: "bg-slate-50 text-slate-700" },
    ...["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"].map(
      (st) => ({ label: st, val: count(st), color: statusColor(st).soft })
    ),
  ]

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-6 flex flex-col gap-y-1">
        <h1 className="text-2xl font-extrabold text-[#0f172a]">My Orders</h1>
        <p className="text-sm text-[#64748b]">
          Track and manage your ingredient orders.
        </p>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mb-4">
        {summary.map((c) => (
          <div key={c.label} className={`${c.color} rounded-xl p-3 text-center`}>
            <div className="text-xl font-extrabold">{c.val}</div>
            <div className="text-[10px] font-medium mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>
      <OrdersTable orders={orders} />
      <div className="mt-10 pt-8 border-t border-gray-100">
        <TransferRequestForm />
      </div>
    </div>
  )
}
