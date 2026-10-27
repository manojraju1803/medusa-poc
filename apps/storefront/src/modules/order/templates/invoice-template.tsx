import { HttpTypes } from "@medusajs/types"
import { paymentInfoMap } from "@lib/constants"
import { INVOICE_TERMS, SELLER } from "@lib/seller"
import { amountInWords } from "@lib/util/amount-in-words"
import { PAYMENT_TERMS } from "@modules/cart/components/gst-totals"
import { provinceName } from "@modules/checkout/components/province-select/states"
import { hsnOf } from "@modules/products/lib/access"
import PrintButton from "@modules/order/components/invoice-print-button"

type TaxLine = { code?: string | null; rate?: number | null; total?: number | null }
type Taxable = {
  subtotal?: number | null
  amount?: number | null
  discount_subtotal?: number | null
  tax_lines?: TaxLine[] | null
}

const CODES = ["CGST", "SGST", "IGST"] as const

// Pre-tax base and per-code GST (rate %, amount) for one item or shipping line.
// Order tax lines carry their own total; fall back to rate x base otherwise.
const taxesOf = (line: Taxable) => {
  const base = (line.subtotal ?? line.amount ?? 0) - (line.discount_subtotal ?? 0)
  const byCode = Object.fromEntries(
    CODES.map((code) => [code, { rate: 0, amount: 0 }])
  ) as Record<(typeof CODES)[number], { rate: number; amount: number }>
  for (const tax of line.tax_lines ?? []) {
    const code = (tax.code ?? "").toUpperCase() as (typeof CODES)[number]
    if (!byCode[code]) continue
    byCode[code].rate += tax.rate ?? 0
    byCode[code].amount +=
      typeof tax.total === "number" ? tax.total : (base * (tax.rate ?? 0)) / 100
  }
  const tax = CODES.reduce((sum, c) => sum + byCode[c].amount, 0)
  return { base, byCode, total: base + tax }
}

const num = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const date = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, ".")
    : ""

const addressLines = (
  a: HttpTypes.StoreOrderAddress | null | undefined,
  gstin: string
) => {
  if (!a) return []
  const name = a.company || [a.first_name, a.last_name].filter(Boolean).join(" ")
  return [
    name.toUpperCase(),
    a.address_1,
    a.address_2,
    [a.city, a.postal_code].filter(Boolean).join("-"),
    [provinceName(a.province), "India"].filter(Boolean).join(", "),
    gstin ? `GST NO- ${gstin}` : "",
  ].filter(Boolean) as string[]
}

const cell = "border border-black px-1.5 py-[3px]"

const AddressBox = ({ title, lines }: { title: string; lines: string[] }) => (
  <div>
    <p className="font-bold text-[12px] mb-0.5">{title}</p>
    <table className="w-full border-collapse">
      <tbody>
        {Array.from({ length: 9 }, (_, i) => (
          <tr key={i}>
            <td className={`${cell} h-[18px] ${i === 0 ? "font-bold" : ""}`}>
              {lines[i] ?? ""}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const InvoiceTemplate = ({ order }: { order: HttpTypes.StoreOrder }) => {
  const metadata = (order.metadata ?? {}) as Record<string, unknown>
  const gstin = String(metadata.gst_number ?? "")
  const shipping = order.shipping_methods?.[0]
  const isPickup = /pickup/i.test(shipping?.name ?? "")

  const rows = (order.items ?? []).map((item) => ({
    item,
    hsn: item.product ? hsnOf(item.product as HttpTypes.StoreProduct) : undefined,
    ...taxesOf(item as Taxable),
  }))
  const itemsValue = rows.reduce((sum, r) => sum + r.total, 0)
  const transport = shipping ? taxesOf(shipping as Taxable) : null
  const transportValue = transport?.total ?? 0
  const invoiceTotal = Math.round(order.total ?? itemsValue + transportValue)

  const provider = order.payment_collections?.[0]?.payments?.[0]?.provider_id
  const paymentMode =
    PAYMENT_TERMS[String(metadata.payment_term ?? "")] ??
    (provider ? paymentInfoMap[provider]?.title : undefined) ??
    ""

  const details: [string, string][] = [
    ["Invoice No.", String(order.display_id ?? "")],
    ["Dated", date(order.created_at)],
    ["Mode of payment", paymentMode],
    ["Buyers Order No.", String(metadata.po_number ?? "")],
    ["Dated", metadata.po_number ? date(order.created_at) : ""],
    ["Despatched Doc no.", ""],
    ["Delivery Note Date", ""],
    ["Despatched through", isPickup ? "Self Pickup" : ""],
    ["Destination", (order.shipping_address?.city ?? "").toUpperCase()],
    ["E way Bill No", ""],
  ]

  const taxCells = (byCode: ReturnType<typeof taxesOf>["byCode"]) =>
    CODES.map((c) => (
      <FragmentCells key={c} rate={byCode[c].rate} amount={byCode[c].amount} />
    ))

  return (
    <div className="bg-gray-100 print:bg-white min-h-screen py-6 print:py-0">
      <style>{`@page { size: A4; margin: 10mm } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact } }`}</style>

      <div className="max-w-[900px] mx-auto mb-4 flex justify-end gap-2 px-4 print:hidden">
        <PrintButton />
      </div>

      <div
        className="relative max-w-[900px] mx-auto bg-white text-black text-[11px] leading-tight p-6 shadow print:shadow-none print:p-0 overflow-hidden"
        data-testid="invoice"
      >
        {/* Watermark */}
        <img
          src="/icon.png"
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute left-1/2 top-1/2 w-[420px] max-w-[70%] -translate-x-1/2 -translate-y-1/2 opacity-[0.1]"
          data-testid="invoice-watermark"
        />

        <div className="relative">
          {/* Seller + logo */}
          <div className="flex justify-between gap-4 border border-gray-300 border-b-0 px-2 pt-2">
            <div className="font-bold text-[11px] space-y-[1px] pb-2">
              <p className="text-[12px]">SELLER: {SELLER.name}</p>
              {SELLER.address.map((l) => (
                <p key={l}>{l}</p>
              ))}
              <p>Contact no: {SELLER.phone}</p>
              <p>Email Id: {SELLER.email}</p>
              <p>GSTIN/UIN: {SELLER.gstin}</p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <img src="/logo-full.png" alt="Ingredients Bazar" className="h-14 w-auto" />
              <p className="text-[9px] font-bold tracking-wide text-[#4d7c0f]">
                NEXT GENERATION MULTI BRAND INGREDIENTS PLATFORM
              </p>
            </div>
          </div>
          <div className="flex justify-between border border-gray-300 border-t-0 px-2 pb-1 text-[10px] font-bold">
            <span />
            <span>FSSAI NO - {SELLER.fssai}</span>
            <span>UDYAM No - {SELLER.udyam}</span>
          </div>

          {/* Buyer + invoice details */}
          <div className="grid grid-cols-[1fr_1fr_1.1fr] gap-4 mt-3">
            <AddressBox title="BUYER: BILLED TO" lines={addressLines(order.billing_address, gstin)} />
            <AddressBox title="BUYER: SHIPPED TO" lines={addressLines(order.shipping_address, gstin)} />
            <div className="pt-[17px]">
              <table className="w-full border-collapse">
                <tbody>
                  {details.map(([k, v], i) => (
                    <tr key={`${k}-${i}`}>
                      <td className={`${cell} h-[18px] w-[48%]`}>{k}</td>
                      <td className={cell}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <hr className="my-3 border-gray-300" />

          {/* Line items */}
          <table className="w-full border-collapse text-center" data-testid="invoice-items">
            <thead className="font-bold">
              <tr>
                <th rowSpan={2} className={`${cell} text-[12px] w-[22%]`}>Description</th>
                <th rowSpan={2} className={`${cell} text-[12px]`}>HSN</th>
                <th rowSpan={2} className={`${cell} text-[12px]`}>Qty</th>
                <th rowSpan={2} className={`${cell} text-[12px]`}>Rate</th>
                <th rowSpan={2} className={`${cell} text-[12px]`}>Total</th>
                {CODES.map((c) => (
                  <th key={c} colSpan={2} className={`${cell} text-[12px]`}>{c}</th>
                ))}
                <th rowSpan={2} className={`${cell} text-[12px]`}>Total Value</th>
              </tr>
              <tr>
                {CODES.map((c) => [
                  <th key={`${c}-p`} className={cell}>%</th>,
                  <th key={`${c}-r`} className={cell}>Rate</th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item, hsn, base, byCode, total }) => (
                <tr key={item.id} data-testid="invoice-row">
                  <td className={`${cell} font-semibold`}>{item.product_title ?? item.title}</td>
                  <td className={cell}>{hsn ?? ""}</td>
                  <td className={cell}>{num(item.quantity)}</td>
                  <td className={cell}>{num(item.unit_price)}</td>
                  <td className={cell}>{num(base)}</td>
                  {taxCells(byCode)}
                  <td className={cell}>₹{num(total)}</td>
                </tr>
              ))}
              <tr>
                <td className={cell} colSpan={5} />
                <td className={cell} colSpan={5} />
                <td className={`${cell} font-bold`}>Total Value</td>
                <td className={`${cell} font-bold`}>{num(itemsValue)}</td>
              </tr>
              <tr>
                <td colSpan={12} className="h-4 bg-gray-100 border-x border-black" />
              </tr>
              {/* Transport, in the same columns as the items */}
              <tr>
                <td rowSpan={2} className={`${cell} font-bold text-left`}>Transport</td>
                <td colSpan={3} className={`${cell} font-bold text-left`}>Door Delivery</td>
                <td className={cell}>{!isPickup && transport ? num(transport.base) : ""}</td>
                {!isPickup && transport
                  ? taxCells(transport.byCode)
                  : CODES.map((c) => <FragmentCells key={c} />)}
                <td className={cell}>{!isPickup && transport ? num(transport.total) : ""}</td>
              </tr>
              <tr>
                <td colSpan={3} className={`${cell} font-bold text-left`}>Self Pickup</td>
                <td className={`${cell} font-semibold`}>{isPickup ? "Yes" : ""}</td>
                {CODES.map((c) => (
                  <FragmentCells key={c} />
                ))}
                <td className={cell} />
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="grid grid-cols-[1fr_260px] border border-black border-t-0">
            <div className="p-1.5 space-y-2 border-r border-black">
              <p className="flex justify-between">
                <span>Invoice value including SGST/CGST/IGST value(in words)</span>
                <span className="font-bold pr-24">E &amp; O.E</span>
              </p>
              <p className="pt-3">
                Company&apos;s Pan <span className="font-semibold ml-24">{SELLER.pan}</span>
              </p>
              <p>Shipping Type <span className="font-semibold ml-20">{shipping ? (isPickup ? "Self Pickup" : "Door Delivery") : ""}</span></p>
              <p>
                Amount Chargeable (in words){" "}
                <span className="font-semibold">{amountInWords(invoiceTotal)}</span>
              </p>
            </div>
            <table className="border-collapse w-full self-start">
              <tbody>
                {[
                  ["Subtotal", num(itemsValue)],
                  ["Docket Charges", num(0)],
                  ["Insurance Charges", num(0)],
                  ["Transportation value", num(isPickup ? 0 : transportValue)],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="px-1.5 py-[3px] font-semibold border-b border-black">{k}</td>
                    <td className="px-1.5 py-[3px] text-right border-b border-l border-black">{v}</td>
                  </tr>
                ))}
                <tr>
                  <td className="px-1.5 pt-3 pb-1 font-bold text-[14px]">Invoice Total</td>
                  <td className="px-1.5 pt-3 pb-1 font-bold text-[14px] text-right" data-testid="invoice-total">
                    ₹{invoiceTotal.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Declaration + signatures */}
          <div className="grid grid-cols-[1fr_280px] border border-black border-t-0 min-h-[220px]">
            <div className="border-r border-black flex flex-col">
              <div className="p-1.5 flex-1">
                <p className="font-bold text-[13px] underline">Declaration</p>
                <p className="font-bold mt-0.5">Terms &amp; Condition</p>
                <ol className="mt-1 space-y-1 font-semibold">
                  {INVOICE_TERMS.map((t, i) => (
                    <li key={t}>{`${i + 1}. ${t}`}</li>
                  ))}
                </ol>
              </div>
              <p className="border-t border-black p-1.5 font-bold text-[12px] h-16">
                Customers Seal and Signature
              </p>
            </div>
            <div className="p-1.5 flex flex-col justify-between">
              <p className="font-bold">For {SELLER.legalName}</p>
              <p className="font-bold text-right">Authorised Signature</p>
            </div>
          </div>
          <p className="text-center text-[9px] font-semibold mt-1">This is a Computer Generated Invoice</p>
        </div>
      </div>
    </div>
  )
}

const FragmentCells = ({ rate, amount }: { rate?: number; amount?: number }) => (
  <>
    <td className={cell}>{rate === undefined ? "" : num(rate)}</td>
    <td className={cell}>{amount === undefined ? "" : num(amount)}</td>
  </>
)

export default InvoiceTemplate
