"use client"

import { reorder } from "@lib/data/cart"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

// Adds a past order's items to the cart, then opens the cart.
const ReorderButton = ({
  orderId,
  className = "",
}: {
  orderId: string
  className?: string
}) => {
  const { countryCode } = useParams() as { countryCode: string }
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const onClick = async () => {
    setPending(true)
    setMessage(null)
    try {
      const { added, unavailable } = await reorder(orderId, countryCode)
      if (!added.length) {
        setMessage("None of these items can be ordered right now.")
      } else if (unavailable.length) {
        setMessage(`Added to cart. Not available: ${unavailable.join(", ")}`)
        router.refresh()
      } else {
        router.push(`/${countryCode}/cart`)
        return
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not reorder.")
    }
    setPending(false)
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={`px-3 py-1.5 text-[11px] font-semibold bg-[#4d7c0f] text-white rounded-lg hover:bg-[#3f6212] transition-colors whitespace-nowrap disabled:opacity-60 ${className}`}
        data-testid="reorder-button"
      >
        {pending ? "Reordering…" : "Reorder"}
      </button>
      {message && (
        <span className="text-[10px] text-red-600 max-w-[220px]" data-testid="reorder-message">
          {message}
        </span>
      )}
    </span>
  )
}

export default ReorderButton
