import { HttpTypes } from "@medusajs/types"

// One buyer-facing status from Medusa's order, fulfillment and payment states.
export const orderStatus = (order: HttpTypes.StoreOrder) => {
  if (order.status === "canceled") return "Cancelled"
  const f = order.fulfillment_status as string
  if (f === "delivered" || f === "partially_delivered") return "Delivered"
  if (f === "shipped" || f === "partially_shipped") return "Shipped"
  if (f === "fulfilled" || f === "partially_fulfilled") return "Packed"
  const p = order.payment_status as string
  if (p === "captured" || p === "authorized" || p === "partially_captured")
    return "Confirmed"
  return "Pending"
}

const STYLE: Record<string, string> = {
  Delivered: "bg-[#f0fdf4] text-[#006B4F] border-[#bbf7d0]",
  Shipped: "bg-blue-50 text-blue-700 border-blue-100",
  Packed: "bg-purple-50 text-purple-700 border-purple-100",
  Confirmed: "bg-[#f0fdf4] text-[#006B4F] border-[#bbf7d0]",
  Pending: "bg-amber-50 text-amber-700 border-amber-100",
  Cancelled: "bg-red-50 text-red-600 border-red-100",
}

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold border rounded-full ${
      STYLE[status] || "bg-gray-50 text-gray-600 border-gray-200"
    }`}
    data-testid="order-status"
  >
    {status}
  </span>
)

export const TIMELINE = ["Order placed", "Confirmed", "Packed", "Shipped", "Delivered"]

export const timelineIndex = (status: string) =>
  ({ Pending: 0, Confirmed: 1, Packed: 2, Shipped: 3, Delivered: 4 } as Record<
    string,
    number
  >)[status] ?? 0

export default StatusBadge
