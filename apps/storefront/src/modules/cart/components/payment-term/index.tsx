"use client"

import { updateCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { PAYMENT_TERMS } from "@modules/cart/components/gst-totals"
import { useState } from "react"

// Label only: the chosen term rides on cart.metadata.payment_term and is
// copied to the order. It has no effect on the price.
const PaymentTerm = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const current = String(cart.metadata?.payment_term ?? "")
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const choose = async (term: string) => {
    if (term === current) return
    setSaving(term)
    setError(null)
    await updateCart({
      metadata: { ...(cart.metadata ?? {}), payment_term: term },
    }).catch((e) => setError(e.message))
    setSaving(null)
  }

  return (
    <div data-testid="payment-term-picker">
      <p className="text-xs font-semibold text-[#0f172a] mb-2">Payment term</p>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(PAYMENT_TERMS).map(([key, label]) => {
          const active = (saving ?? current) === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => choose(key)}
              disabled={!!saving}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors ${
                active
                  ? "bg-[#4d7c0f] border-[#4d7c0f] text-white"
                  : "bg-white border-[#ecf6dc] text-[#4d7c0f] hover:bg-[#f6fbee]"
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  )
}

export default PaymentTerm
