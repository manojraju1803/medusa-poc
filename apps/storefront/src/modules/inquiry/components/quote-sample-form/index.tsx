"use client"

import { submitInquiry } from "@lib/data/inquiries"
import { useState, useTransition } from "react"

type Props = {
  productId: string
  variantId?: string
  productTitle: string
  minQuantity?: number
  defaults?: {
    name?: string
    email?: string
    phone?: string
    company?: string
  }
}

const inputClass =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/10 bg-white text-[#0f172a]"
const labelClass = "block text-[11px] font-semibold text-[#64748b] mb-1"

export default function QuoteSampleForm({
  productId,
  variantId,
  productTitle,
  minQuantity,
  defaults = {},
}: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [doneId, setDoneId] = useState<string | null>(null)
  const [wantsQuote, setWantsQuote] = useState(true)
  const [wantsSample, setWantsSample] = useState(false)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const str = (k: string) => String(form.get(k) ?? "").trim()
    if (!wantsQuote && !wantsSample) {
      setError("Choose Quote, Sample or both.")
      return
    }
    const quantity = Number(str("quantity"))
    setError(null)
    startTransition(async () => {
      const res = await submitInquiry({
        type: "quote_sample",
        name: str("name"),
        email: str("email"),
        phone: str("phone") || undefined,
        company: str("company") || undefined,
        message: str("message") || undefined,
        product_id: productId,
        variant_id: variantId,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : undefined,
        unit: str("unit") || "kg",
        wants_quote: wantsQuote,
        wants_sample: wantsSample,
      })
      if (res.ok) {
        setDoneId(res.inquiry.id)
      } else {
        setError(res.error)
      }
    })
  }

  if (doneId) {
    return (
      <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-6 text-center" data-testid="inquiry-success">
        <div className="w-12 h-12 bg-[#166534] rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-[#0f172a]">Request received</h3>
        <p className="text-sm text-[#475569] mt-1">
          Our team will get back to you about {productTitle} within 24–48 hours.
        </p>
        <p className="text-[11px] text-[#64748b] mt-2">Reference: {doneId}</p>
        <button
          type="button"
          onClick={() => setDoneId(null)}
          className="mt-4 px-4 py-2 text-xs font-semibold border border-[#166534]/40 text-[#166534] rounded-lg hover:bg-white"
        >
          Send another request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="inquiry-form">
      <div>
        <label className={labelClass} htmlFor="inq-name">Name *</label>
        <input id="inq-name" name="name" required defaultValue={defaults.name} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="inq-email">Email *</label>
        <input id="inq-email" name="email" type="email" required defaultValue={defaults.email} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="inq-phone">Phone</label>
        <input id="inq-phone" name="phone" type="tel" defaultValue={defaults.phone} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="inq-company">Company</label>
        <input id="inq-company" name="company" defaultValue={defaults.company} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="inq-qty">Quantity</label>
        <div className="flex gap-2">
          <input
            id="inq-qty"
            name="quantity"
            type="number"
            min={1}
            defaultValue={minQuantity && minQuantity > 1 ? minQuantity : undefined}
            className={inputClass}
          />
          <select name="unit" defaultValue="kg" className="w-24 shrink-0 px-2 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#166534] bg-white text-[#0f172a]" aria-label="Unit">
            <option value="kg">kg</option>
          </select>
        </div>
      </div>
      <div>
        <span className={labelClass}>I would like</span>
        <div className="flex items-center gap-4 h-[42px]">
          <label className="inline-flex items-center gap-2 text-sm text-[#0f172a]">
            <input
              type="checkbox"
              checked={wantsQuote}
              onChange={(e) => setWantsQuote(e.target.checked)}
              className="accent-[#166534] w-4 h-4"
            />
            Quote
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-[#0f172a]">
            <input
              type="checkbox"
              checked={wantsSample}
              onChange={(e) => setWantsSample(e.target.checked)}
              className="accent-[#166534] w-4 h-4"
            />
            Sample
          </label>
        </div>
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor="inq-message">Message</label>
        <textarea
          id="inq-message"
          name="message"
          rows={3}
          placeholder="Grade, packaging, delivery location, timelines…"
          className={inputClass}
        />
      </div>
      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="w-full sm:w-auto px-6 py-3 bg-[#166534] hover:bg-[#14532d] disabled:opacity-60 text-white text-sm font-bold rounded-xl"
          data-testid="inquiry-submit"
        >
          {pending ? "Sending…" : "Send request"}
        </button>
      </div>
    </form>
  )
}
