"use client"

import { clx } from "@modules/common/components/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { SortOptions, sortOptions } from "../refinement-list/sort-products"

type Option = { handle: string; title: string }

// Shared URL updater: every filter/sort change goes back to page 1.
const useQueryUpdater = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  return {
    searchParams,
    update: (fn: (p: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      fn(params)
      params.delete("page")
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
  }
}

const FilterGroup = ({
  title,
  param,
  options,
  initialVisible = 8,
}: {
  title: string
  param: string
  options: Option[]
  initialVisible?: number
}) => {
  const { searchParams, update } = useQueryUpdater()
  const [open, setOpen] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const selected = searchParams.getAll(param)
  const visible = showAll ? options : options.slice(0, initialVisible)

  if (!options.length) return null

  const toggle = (handle: string) =>
    update((p) => {
      const next = selected.includes(handle)
        ? selected.filter((h) => h !== handle)
        : [...selected, handle]
      p.delete(param)
      next.forEach((h) => p.append(param, h))
    })

  return (
    <div className="py-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-xs font-bold text-[#0f172a] uppercase tracking-wide"
      >
        {title}
        <span className="text-[#64748b]">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-1.5">
          {visible.map((o) => (
            <label
              key={o.handle}
              className="flex items-center gap-2 text-xs text-[#374151] cursor-pointer hover:text-[#4d7c0f]"
            >
              <input
                type="checkbox"
                checked={selected.includes(o.handle)}
                onChange={() => toggle(o.handle)}
                className="accent-[#4d7c0f] w-3.5 h-3.5"
              />
              <span className="truncate">{o.title}</span>
            </label>
          ))}
          {options.length > initialVisible && (
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="text-[11px] text-[#4d7c0f] font-medium text-left mt-1"
            >
              {showAll ? "− Show less" : `+ ${options.length - initialVisible} more`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export const ListingFilters = ({
  categories,
  brands,
}: {
  categories: Option[]
  brands: Option[]
}) => {
  const { searchParams, update } = useQueryUpdater()
  const [mobileOpen, setMobileOpen] = useState(false)
  const active =
    searchParams.getAll("category").length + searchParams.getAll("brand").length

  const panel = (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-bold text-[#0f172a]">Filters</span>
        {active > 0 && (
          <button
            type="button"
            onClick={() =>
              update((p) => {
                p.delete("category")
                p.delete("brand")
              })
            }
            className="text-xs text-[#4d7c0f] font-medium flex items-center gap-1"
          >
            Clear All
            <span className="bg-[#4d7c0f] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {active}
            </span>
          </button>
        )}
      </div>
      <div className="px-4 divide-y divide-gray-100">
        <FilterGroup title="Ingredient Category" param="category" options={categories} />
        <FilterGroup title="Brand" param="brand" options={brands} />
      </div>
    </div>
  )

  return (
    <aside className="w-full small:w-[236px] shrink-0" data-testid="listing-filters">
      <button
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        className="small:hidden mb-3 flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-[#374151]"
      >
        Filters
        {active > 0 && (
          <span className="bg-[#4d7c0f] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {active}
          </span>
        )}
      </button>
      <div className={clx("small:block", mobileOpen ? "block mb-4" : "hidden")}>
        {panel}
      </div>
    </aside>
  )
}

export const ListingToolbar = ({
  sortBy,
  viewMode,
  showPriceSort,
  chips,
}: {
  sortBy: SortOptions
  viewMode: "grid" | "list"
  showPriceSort: boolean
  // selected filters, shown as removable chips
  chips: { param: string; handle: string; title: string }[]
}) => {
  const { update } = useQueryUpdater()
  const options = sortOptions.filter(
    (o) => showPriceSort || !o.value.startsWith("price")
  )

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <span
            key={`${c.param}-${c.handle}`}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#f6fbee] border border-[#d9edb8] text-[#4d7c0f] text-[11px] font-medium rounded-full"
          >
            {c.title}
            <button
              type="button"
              aria-label={`Remove ${c.title}`}
              onClick={() =>
                update((p) => {
                  const rest = p.getAll(c.param).filter((h) => h !== c.handle)
                  p.delete(c.param)
                  rest.forEach((h) => p.append(c.param, h))
                })
              }
              className="hover:text-[#3f6212]"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-[#64748b] whitespace-nowrap" htmlFor="sort-by">
          Sort by:
        </label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => update((p) => p.set("sortBy", e.target.value))}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#4d7c0f] bg-white text-[#374151]"
          data-testid="sort-by"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label.replace("->", "→")}
            </option>
          ))}
        </select>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          {(["grid", "list"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-label={`${mode} view`}
              aria-pressed={viewMode === mode}
              onClick={() =>
                update((p) => (mode === "grid" ? p.delete("view") : p.set("view", mode)))
              }
              className={clx(
                "p-1.5 transition-colors",
                mode === "list" && "border-l border-gray-200",
                viewMode === mode
                  ? "bg-[#4d7c0f] text-white"
                  : "bg-white text-gray-400 hover:text-[#4d7c0f]"
              )}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                {mode === "grid" ? (
                  <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
                ) : (
                  <path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" />
                )}
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
