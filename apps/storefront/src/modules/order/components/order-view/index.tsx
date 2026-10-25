import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import GstTotals, {
  PAYMENT_TERMS,
  PaymentTermChip,
} from "@modules/cart/components/gst-totals"
import { provinceName } from "@modules/checkout/components/province-select/states"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import InvoiceButton from "@modules/order/components/invoice-button"
import StatusBadge, {
  TIMELINE,
  orderStatus,
  timelineIndex,
} from "@modules/order/components/status-badge"
import Thumbnail from "@modules/products/components/thumbnail"

const PAYMENT_LABEL: Record<string, string> = {
  pp_system_default: "Mock B2B Payment (Demo Instant Approval)",
}

const Card = ({
  title,
  children,
  className = "",
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={`bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden ${className}`}
  >
    {title && (
      <div className="px-5 py-3.5 border-b border-gray-100 bg-[#f8fffe]">
        <h2 className="text-sm font-bold text-[#0f172a]">{title}</h2>
      </div>
    )}
    <div className="px-5 py-4">{children}</div>
  </div>
)

const OrderView = ({
  order,
  metadata,
}: {
  order: HttpTypes.StoreOrder
  metadata?: Record<string, unknown> | null
}) => {
  const fmt = (amount: number) =>
    convertToLocale({ amount, currency_code: order.currency_code })
  const status = orderStatus(order)
  const step = timelineIndex(status)
  const term = PAYMENT_TERMS[String(metadata?.payment_term ?? "")]
  const address = order.shipping_address
  const payment = order.payment_collections?.[0]?.payments?.[0]
  const items = [...(order.items ?? [])].sort((a, b) =>
    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  )

  return (
    <div className="flex flex-col gap-5" data-testid="order-view">
      <Card>
        <div className="flex flex-col small:flex-row small:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-[#0f172a]">
                Order{" "}
                <span className="font-mono text-[#006B4F]" data-testid="order-id">
                  #{order.display_id}
                </span>
              </h2>
              <StatusBadge status={status} />
              {term && <PaymentTermChip label={term} />}
            </div>
            <p className="text-xs text-[#64748b] mt-1">
              Placed on{" "}
              <span data-testid="order-date">
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>{" "}
              · Confirmation sent to{" "}
              <span className="font-semibold text-[#0f172a]" data-testid="order-email">
                {order.email}
              </span>
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <InvoiceButton />
            <LocalizedClientLink
              href="/contact"
              className="px-3 py-1.5 border border-[#006B4F]/40 text-[#006B4F] text-xs font-bold rounded-lg hover:bg-[#f0fdf4] transition-colors"
            >
              Contact us
            </LocalizedClientLink>
          </div>
        </div>
        {status !== "Cancelled" && (
          <div className="mt-5 grid grid-cols-5 gap-1">
            {TIMELINE.map((label, i) => (
              <div key={label} className="flex flex-col gap-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    i <= step ? "bg-[#006B4F]" : "bg-gray-200"
                  }`}
                />
                <span
                  className={`text-[10px] small:text-[11px] ${
                    i <= step ? "text-[#006B4F] font-semibold" : "text-[#9ca3af]"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 small:grid-cols-[1fr_340px] gap-5">
        <div className="flex flex-col gap-5 min-w-0">
          <Card title={`Items (${items.length})`}>
            <div className="divide-y divide-gray-50 -my-2" data-testid="products-table">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-3"
                  data-testid="product-row"
                >
                  <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden border border-gray-100">
                    <Thumbnail thumbnail={item.thumbnail} size="square" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold text-[#0f172a] truncate"
                      data-testid="product-name"
                    >
                      {item.product_title}
                    </p>
                    <p className="text-xs text-[#64748b]">
                      {[item.product_collection, item.variant_sku]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="text-xs text-[#4b5563] mt-0.5">
                      <span data-testid="product-quantity">{item.quantity}</span>{" "}
                      × {fmt(item.unit_price)}
                      {item.tax_lines?.length ? (
                        <span className="text-[#9ca3af]">
                          {" "}
                          · GST{" "}
                          {item.tax_lines
                            .map((t) => `${t.code} ${t.rate}%`)
                            .join(" + ")}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-[#006B4F]">
                    {fmt(item.subtotal ?? item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 small:grid-cols-2 gap-5">
            <Card title="Delivery">
              {address ? (
                <div
                  className="text-sm text-[#4b5563] space-y-0.5"
                  data-testid="shipping-address-summary"
                >
                  <p className="font-semibold text-[#0f172a]">
                    {address.first_name} {address.last_name}
                  </p>
                  {address.company && <p>{address.company}</p>}
                  <p>
                    {address.address_1} {address.address_2}
                  </p>
                  <p>
                    {address.city} {address.postal_code}
                  </p>
                  <p>
                    {provinceName(address.province)}
                    {address.province ? ", " : ""}
                    {address.country_code?.toUpperCase()}
                  </p>
                  {address.phone && <p className="pt-1">{address.phone}</p>}
                </div>
              ) : (
                <p className="text-sm text-[#64748b]">No address</p>
              )}
              {order.shipping_methods?.[0] && (
                <p className="text-xs text-[#64748b] mt-3" data-testid="shipping-method">
                  {order.shipping_methods[0].name} ·{" "}
                  {fmt(order.shipping_methods[0].amount ?? 0)}
                </p>
              )}
            </Card>
            <Card title="Payment">
              <div className="text-sm text-[#4b5563] space-y-1" data-testid="payment-summary">
                <p className="font-semibold text-[#0f172a]">
                  {(payment?.provider_id && PAYMENT_LABEL[payment.provider_id]) ||
                    "Manual payment"}
                </p>
                {term && <p>Term: {term}</p>}
                <p className="capitalize">
                  Status: {String(order.payment_status ?? "").replace(/_/g, " ")}
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="min-w-0">
          <Card title="Order summary">
            <GstTotals source={{ ...order, metadata: null }} />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OrderView
