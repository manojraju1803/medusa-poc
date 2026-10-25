import { convertToLocale } from "@lib/util/money"

type TaxLine = { code?: string | null; rate?: number | null; total?: number | null }

type Taxable = {
  subtotal?: number | null
  amount?: number | null
  discount_subtotal?: number | null
  tax_lines?: TaxLine[] | null
}

export type GstTotalsSource = {
  currency_code: string
  item_subtotal?: number | null
  shipping_subtotal?: number | null
  discount_subtotal?: number | null
  tax_total?: number | null
  total?: number | null
  items?: Taxable[] | null
  shipping_methods?: Taxable[] | null
  metadata?: Record<string, unknown> | null
}

export const PAYMENT_TERMS: Record<string, string> = {
  advance: "Advance",
  "15_days": "15 days credit",
  "30_days": "30 days credit",
}

// GST per tax code (CGST, SGST, IGST), summed from the tax lines the backend's
// india-gst provider wrote. Order tax lines carry their own total; cart tax
// lines only carry the rate, so the amount is taken from the line's pre-tax
// base. Nothing here assumes a rate.
export const gstBreakdown = (source: GstTotalsSource) => {
  const byCode = new Map<string, number>()
  const add = (line: Taxable) => {
    const base =
      (line.subtotal ?? line.amount ?? 0) - (line.discount_subtotal ?? 0)
    for (const tax of line.tax_lines ?? []) {
      const code = (tax.code || "GST").toUpperCase()
      const amount =
        typeof tax.total === "number"
          ? tax.total
          : (base * (tax.rate ?? 0)) / 100
      byCode.set(code, (byCode.get(code) ?? 0) + amount)
    }
  }
  source.items?.forEach(add)
  source.shipping_methods?.forEach(add)

  const order = ["CGST", "SGST", "IGST"]
  return Array.from(byCode.entries())
    .sort(([a], [b]) => {
      const ia = order.indexOf(a)
      const ib = order.indexOf(b)
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
    })
    .map(([code, amount]) => ({ code, amount }))
}

const GST_LABEL: Record<string, string> = {
  CGST: "CGST (Central)",
  SGST: "SGST (State)",
  IGST: "IGST (Inter-state)",
}

const GstTotals = ({
  source,
  shippingSelected = true,
}: {
  source: GstTotalsSource
  // Before a delivery method is chosen the shipping cost isn't known yet.
  shippingSelected?: boolean
}) => {
  const fmt = (amount: number) =>
    convertToLocale({ amount, currency_code: source.currency_code })
  const lines = gstBreakdown(source)
  const term = PAYMENT_TERMS[String(source.metadata?.payment_term ?? "")]

  return (
    <div className="space-y-2.5 text-sm" data-testid="gst-totals">
      <div className="flex items-center justify-between">
        <span className="text-[#4b5563]">Items subtotal</span>
        <span className="font-semibold text-[#0f172a]" data-testid="cart-subtotal">
          {fmt(source.item_subtotal ?? 0)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[#4b5563]">Shipping</span>
        <span className="font-semibold text-[#0f172a]" data-testid="cart-shipping">
          {shippingSelected ? fmt(source.shipping_subtotal ?? 0) : "At checkout"}
        </span>
      </div>
      {!!source.discount_subtotal && (
        <div className="flex items-center justify-between">
          <span className="text-[#4b5563]">Discount</span>
          <span className="font-semibold text-[#4d7c0f]">
            - {fmt(source.discount_subtotal)}
          </span>
        </div>
      )}
      {lines.length > 0 ? (
        lines.map((line) => (
          <div
            key={line.code}
            className="flex items-center justify-between"
            data-testid={`gst-${line.code.toLowerCase()}`}
          >
            <span className="text-[#4b5563]">{GST_LABEL[line.code] ?? line.code}</span>
            <span className="font-semibold text-[#0f172a]">{fmt(line.amount)}</span>
          </div>
        ))
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-[#4b5563]">GST</span>
          <span className="text-xs text-[#64748b]">
            {source.tax_total ? fmt(source.tax_total) : "Calculated from delivery state"}
          </span>
        </div>
      )}
      {lines.length > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#64748b]">Total GST</span>
          <span className="text-[#64748b]" data-testid="cart-taxes">
            {fmt(source.tax_total ?? 0)}
          </span>
        </div>
      )}
      <div className="border-t border-dashed border-gray-200 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-[#0f172a]">Total</span>
          <span
            className="text-xl font-extrabold text-[#4d7c0f]"
            data-testid="cart-total"
          >
            {fmt(source.total ?? 0)}
          </span>
        </div>
        <p className="text-[10px] text-[#9ca3af] mt-0.5 text-right">
          Inclusive of GST
        </p>
      </div>
      {term && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-[#64748b]">Payment term</span>
          <PaymentTermChip label={term} />
        </div>
      )}
    </div>
  )
}

export const PaymentTermChip = ({ label }: { label: string }) => (
  <span
    className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold bg-[#f6fbee] border border-[#ecf6dc] text-[#4d7c0f] rounded-full"
    data-testid="payment-term-chip"
  >
    {label}
  </span>
)

export default GstTotals
