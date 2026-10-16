"use client"

import { useMemo, useState } from "react"
import type { Supplier } from "../data"
import SupplierCard from "./supplier-card"

const SupplierDirectory = ({ suppliers }: { suppliers: Supplier[] }) => {
  const [search, setSearch] = useState("")
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return term
      ? suppliers.filter(
          (s) =>
            s.title.toLowerCase().includes(term) ||
            s.country?.toLowerCase().includes(term)
        )
      : suppliers
  }, [search, suppliers])

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex-1 min-w-[220px] max-w-[360px] flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 gap-2">
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
        <span className="text-sm text-[#64748b]">
          <strong className="text-[#0f172a]">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "supplier" : "suppliers"}
        </span>
      </div>
      {filtered.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((s) => (
            <SupplierCard key={s.id} supplier={s} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-sm text-[#64748b]">
          No suppliers match your search.
        </div>
      )}
    </div>
  )
}

export default SupplierDirectory
