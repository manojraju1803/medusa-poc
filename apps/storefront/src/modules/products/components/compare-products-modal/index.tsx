"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CompareToggle from "@modules/products/components/compare-toggle"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export type CompareItem = {
  id: string
  handle: string
  title: string
  thumbnail?: string | null
  brand?: string
  // Only set for approved viewers (formatted on the server).
  price?: string
  best?: boolean
  moq: string
  hsn?: string
}

type Props = {
  items: CompareItem[]
  currentId: string
  categoryName?: string
}

export default function CompareProductsModal({ items, currentId, categoryName }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="py-2.5 border border-[#0077cf]/40 text-[#0077cf] text-sm font-semibold rounded-xl hover:bg-blue-50"
        data-testid="compare-products-open"
      >
        Compare Products
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="brand-comparison-title"
            className="w-full max-w-5xl max-h-[88vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-5 border-b border-gray-100">
              <div>
                <h2 id="brand-comparison-title" className="text-xl font-extrabold text-[#0f172a]">
                  Compare Products
                </h2>
                <p className="text-xs text-[#64748b] mt-1">
                  Compare products{categoryName ? ` in ${categoryName}` : ""} before making a sourcing decision.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close brand comparison"
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-[#64748b] hover:bg-gray-50 hover:text-[#0f172a]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(88vh-88px)] p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((item) => {
                  const isCurrent = item.id === currentId
                  return (
                    <div
                      key={item.id}
                      className={`relative overflow-hidden rounded-xl border bg-white ${
                        isCurrent ? "border-[#0077cf] ring-2 ring-[#0077cf]/10" : "border-gray-200"
                      }`}
                    >
                      <div className="relative aspect-[4/3] bg-white border-b border-gray-100">
                        {item.thumbnail && (
                          <Image src={item.thumbnail} alt={item.title} fill sizes="240px" className="object-contain p-3" />
                        )}
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                          {isCurrent && (
                            <span className="px-2 py-1 bg-[#0077cf] text-white text-[9px] font-bold rounded">Current Product</span>
                          )}
                          {item.best && (
                            <span className="px-2 py-1 bg-[#4d7c0f] text-white text-[9px] font-bold rounded">Best Price</span>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-[#0f172a] line-clamp-2 min-h-10">{item.title}</h3>
                        {item.brand && <p className="text-[10px] text-[#64748b] mt-1">{item.brand}</p>}
                        <div className="mt-4 space-y-2 border-y border-gray-100 py-3">
                          {(
                            [
                              ["Price", item.price ?? "Login to view"],
                              ["MOQ", item.moq],
                              ["HSN Code", item.hsn ?? "Not available"],
                            ] as [string, string][]
                          ).map(([label, value]) => (
                            <div key={label} className="flex items-start justify-between gap-3 text-[10px]">
                              <span className="text-[#64748b]">{label}</span>
                              <span className="font-semibold text-[#0f172a] text-right">{value}</span>
                            </div>
                          ))}
                        </div>
                        <LocalizedClientLink
                          href={`/products/${item.handle}`}
                          className="block w-full mt-3 py-2 text-center border border-[#4d7c0f]/30 text-[#4d7c0f] text-xs font-bold rounded-lg hover:bg-[#f6fbee]"
                        >
                          {isCurrent ? "View Current Product" : "View Product"}
                        </LocalizedClientLink>
                        <div className="mt-2 flex justify-center">
                          <CompareToggle productId={item.id} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 text-center">
                <LocalizedClientLink href="/compare" className="text-xs font-semibold text-[#0077cf] hover:underline">
                  Open full comparison page
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
