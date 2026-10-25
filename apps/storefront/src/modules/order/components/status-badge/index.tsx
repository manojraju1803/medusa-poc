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

// One colour per status, shared by the badge, the orders-page count tiles and
// the order timeline. Full class strings so Tailwind's scanner picks them up.
export const STATUS_COLORS: Record<
  string,
  { soft: string; border: string; bar: string; text: string }
> = {
  Pending: { soft: "bg-amber-50 text-amber-700", border: "border-amber-200", bar: "bg-amber-500", text: "text-amber-700" },
  Confirmed: { soft: "bg-sky-50 text-sky-700", border: "border-sky-200", bar: "bg-sky-500", text: "text-sky-700" },
  Packed: { soft: "bg-purple-50 text-purple-700", border: "border-purple-200", bar: "bg-purple-500", text: "text-purple-700" },
  Shipped: { soft: "bg-indigo-50 text-indigo-700", border: "border-indigo-200", bar: "bg-indigo-500", text: "text-indigo-700" },
  Delivered: { soft: "bg-[#f6fbee] text-[#4d7c0f]", border: "border-[#d9edb8]", bar: "bg-[#4d7c0f]", text: "text-[#4d7c0f]" },
  Cancelled: { soft: "bg-red-50 text-red-600", border: "border-red-200", bar: "bg-red-500", text: "text-red-600" },
}

const FALLBACK = { soft: "bg-slate-50 text-slate-600", border: "border-slate-200", bar: "bg-slate-400", text: "text-slate-600" }

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
