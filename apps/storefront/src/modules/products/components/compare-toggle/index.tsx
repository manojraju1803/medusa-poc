"use client"

import { clx } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  COMPARE_MAX,
  readCompare,
  useCompareList,
  writeCompare,
} from "@modules/products/lib/compare-store"
import { useState } from "react"

type Props = {
  productId: string
  variant?: "checkbox" | "button"
}

export default function CompareToggle({ productId, variant = "checkbox" }: Props) {
  const ids = useCompareList()
  const [full, setFull] = useState(false)
  const checked = ids.includes(productId)

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const current = readCompare()
    if (current.includes(productId)) {
      writeCompare(current.filter((id) => id !== productId))
      setFull(false)
    } else if (current.length >= COMPARE_MAX) {
      setFull(true)
    } else {
      writeCompare([...current, productId])
    }
  }

  if (variant === "button") {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={toggle}
          data-testid="compare-toggle"
          className={clx(
            "w-full py-2.5 border text-sm font-semibold rounded-xl transition-colors",
            checked
              ? "bg-[#0757a8] border-[#0757a8] text-white"
              : "border-[#0757a8]/40 text-[#0757a8] hover:bg-blue-50"
          )}
        >
          {checked ? "Added to compare ✓" : "Add to compare"}
        </button>
        {(checked || full) && (
          <span className="text-[11px] text-[#64748b] text-center">
            {full ? `Compare holds up to ${COMPARE_MAX} products. ` : ""}
            <LocalizedClientLink href="/compare" className="text-[#0757a8] font-semibold hover:underline">
              View compare ({ids.length})
            </LocalizedClientLink>
          </span>
        )}
      </div>
    )
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        data-testid="compare-toggle"
        className="flex items-center gap-1.5 text-[11px] text-[#64748b] hover:text-[#006B4F] transition-colors"
      >
        <span
          className={clx(
            "w-3.5 h-3.5 border rounded flex items-center justify-center",
            checked ? "bg-[#006B4F] border-[#006B4F]" : "border-gray-300"
          )}
        >
          {checked && (
            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        Compare
      </button>
      {checked && (
        <LocalizedClientLink href="/compare" className="text-[11px] text-[#0757a8] hover:underline">
          View ({ids.length})
        </LocalizedClientLink>
      )}
      {full && !checked && (
        <span className="text-[10px] text-amber-700">Max {COMPARE_MAX}</span>
      )}
    </span>
  )
}
