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

// main's status palette, shared by the badge and the orders-page count tiles.
// Confirmed uses the brand blue so it no longer looks the same as Delivered.
// Full class strings so Tailwind's scanner picks them up.
export const STATUS_COLORS: Record<string, { soft: string; border: string }> = {
  Pending: { soft: "bg-amber-50 text-amber-700", border: "border-amber-100" },
  Confirmed: { soft: "bg-[#eaf5fc] text-[#0077cf]", border: "border-[#cfe5f4]" },
  Packed: { soft: "bg-purple-50 text-purple-700", border: "border-purple-100" },
  Shipped: { soft: "bg-blue-50 text-blue-700", border: "border-blue-100" },
  Delivered: { soft: "bg-[#f6fbee] text-[#4d7c0f]", border: "border-[#d9edb8]" },
  Cancelled: { soft: "bg-red-50 text-red-600", border: "border-red-100" },
}

const FALLBACK = { soft: "bg-gray-50 text-gray-600", border: "border-gray-200" }

export const statusColor = (status: string) => STATUS_COLORS[status] ?? FALLBACK

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold border rounded-full ${
      statusColor(status).soft
    } ${statusColor(status).border}`}
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
