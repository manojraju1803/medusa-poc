"use client"

import { useMemo, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { Supplier } from "../data"
import SupplierCard from "./supplier-card"
import SupplierLogo from "./supplier-logo"

const SupplierDirectory = ({ suppliers }: { suppliers: Supplier[] }) => {
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [countries, setCountries] = useState<string[]>([])

  const allCountries = useMemo(
    () =>
      Array.from(
        new Set(suppliers.map((s) => s.country).filter(Boolean) as string[])
      ).sort(),
    [suppliers]
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return suppliers.filter(
      (s) =>
        (!term ||
          s.title.toLowerCase().includes(term) ||
          s.country?.toLowerCase().includes(term)) &&
        (!countries.length || (s.country && countries.includes(s.country)))
    )
  }, [search, suppliers, countries])

  const toggleCountry = (c: string) =>
    setCountries((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    )

  return (
    <div className="flex gap-5">
      {allCountries.length > 0 && (
        <aside className="hidden lg:block w-[210px] shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sticky top-[72px]">
            <h3 className="text-xs font-bold text-[#0f172a] uppercase tracking-wide mb-3">
              Filter Suppliers
            </h3>
            <div className="mb-4">
              <p className="text-[9px] font-bold text-[#6b7280] uppercase tracking-wider mb-2">
                Country
              </p>
              {allCountries.map((c) => (
                <label key={c} className="flex items-center gap-2 py-0.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={countries.includes(c)}
                    onChange={() => toggleCountry(c)}
                    className="w-3 h-3 accent-[#166534]"
                  />
                  <span className="text-[10px] text-[#374151]">{c}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 max-w-[300px] flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 gap-2">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search suppliers…"
                className="flex-1 text-sm outline-none bg-transparent"
                data-testid="supplier-search"
              />
            </div>
            <span className="text-sm text-[#6b7280]">
              <strong className="text-[#0f172a]">{filtered.length}</strong>{" "}
              suppliers
            </span>
          </div>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {(["grid", "list"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                aria-label={`${m} view`}
                className={`p-1.5 ${viewMode === m ? "bg-[#166534] text-white" : "bg-white text-gray-400"} transition-colors`}
              >
                {m === "grid" ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {!filtered.length ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-sm text-[#64748b]">
            No suppliers match your search.
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <SupplierCard key={s.id} supplier={s} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-[#166534]/25 hover:shadow-md transition-all flex items-center gap-4 p-4"
              >
                <SupplierLogo supplier={s} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0f172a]">{s.title}</p>
                  <p className="text-[10px] text-[#6b7280]">
                    {[s.country, `${s.productCount} ${s.productCount === 1 ? "product" : "products"}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {s.description && (
                    <p className="text-[10px] text-[#6b7280] line-clamp-1 mt-0.5">
                      {s.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <LocalizedClientLink
                    href={`/collections/${s.handle}`}
                    className="px-3 py-1.5 bg-[#166534] text-white text-[10px] font-bold rounded-lg hover:bg-[#14532d] transition-colors"
                  >
                    View Profile
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href={`/contact?subject=${encodeURIComponent(`Enquiry about ${s.title}`)}`}
                    className="px-3 py-1.5 border border-[#166534]/40 text-[#166534] text-[10px] font-bold rounded-lg hover:bg-[#f0fdf4] transition-colors"
                  >
                    Contact
                  </LocalizedClientLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SupplierDirectory
