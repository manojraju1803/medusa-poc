import Image from "next/image"
import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { retrieveCustomer } from "@lib/data/customer"
import { OptionValueIds } from "@lib/util/product-option-filters"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import {
  ListingFilters,
  ListingToolbar,
} from "@modules/store/components/listing-controls"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import WarehouseFilter from "@modules/store/components/warehouse-filter"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  optionValueIds,
  categoryHandles = [],
  brandHandles = [],
  viewMode = "grid",
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  categoryHandles?: string[]
  brandHandles?: string[]
  viewMode?: "grid" | "list"
}) => {
  const pageNumber = page ? parseInt(page) || 1 : 1
  const sort = sortBy || "created_at"

  const [categories, { collections }, customer] = await Promise.all([
    listCategories({
      fields: "id,name,handle,parent_category_id",
      parent_category_id: "null",
      limit: 100,
    }).catch(() => []),
    listCollections({ fields: "id,title,handle" }).catch(() => ({
      collections: [],
    })),
    retrieveCustomer(),
  ])

  const categoryOptions = categories
    .map((c) => ({ id: c.id, handle: c.handle, title: c.name }))
    .sort((a, b) => a.title.localeCompare(b.title))
  const brandOptions = collections
    .map((c) => ({ id: c.id, handle: c.handle, title: c.title }))
    .sort((a, b) => a.title.localeCompare(b.title))

  const selectedCategories = categoryOptions.filter((c) =>
    categoryHandles.includes(c.handle)
  )
  const selectedBrands = brandOptions.filter((b) =>
    brandHandles.includes(b.handle)
  )

  const chips = [
    ...selectedCategories.map((c) => ({ param: "category", ...c })),
    ...selectedBrands.map((b) => ({ param: "brand", ...b })),
  ]

  return (
    <div className="bg-[#f8fffe] min-h-screen" data-testid="category-container">
      <div className="relative bg-white border-b border-gray-100 overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-[38%] hidden lg:block">
          {/* Decorative, desktop only. Lazy, so phones (where it's hidden)
              don't download it. */}
          <Image
            src="/home-hero.jpg"
            alt=""
            fill
            sizes="38vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent" />
        </div>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          <nav className="flex items-center gap-2 text-xs text-[#9ca3af] mb-4">
            <LocalizedClientLink href="/" className="hover:text-[#166534]">
              Home
            </LocalizedClientLink>
            <span>›</span>
            <span className="text-[#374151] font-medium">Ingredients</span>
          </nav>
          <h1
            className="text-3xl font-extrabold text-[#0f172a] mb-2 leading-tight"
            data-testid="store-page-title"
          >
            Find the Right <span className="text-[#166534]">Ingredient</span>
          </h1>
          <p className="text-sm text-[#64748b] max-w-[640px]">
            Browse verified ingredients by category and brand. Approved business
            buyers see bulk prices, quantity slabs and live stock.
          </p>
          <form
            action={`/${countryCode}/search`}
            method="get"
            className="flex gap-0 max-w-[620px] mt-5"
          >
            <div className="flex flex-1 items-center bg-white border border-gray-200 rounded-l-xl overflow-hidden focus-within:border-[#166534] focus-within:ring-2 focus-within:ring-[#166534]/10 transition-all">
              <svg className="w-4 h-4 text-gray-400 ml-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                name="q"
                placeholder="Search by ingredient name or supplier…"
                className="flex-1 px-3 py-3.5 text-sm outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-sm rounded-r-xl transition-colors shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col small:flex-row gap-5">
        <ListingFilters categories={categoryOptions} brands={brandOptions} />
        <div className="flex-1 min-w-0">
          <Suspense fallback={null}>
            <WarehouseFilter />
          </Suspense>
          <ListingToolbar
            sortBy={sort}
            viewMode={viewMode}
            showPriceSort={!!customer}
            chips={chips}
          />
          <Suspense
            key={`${sort}-${pageNumber}-${viewMode}-${categoryHandles.join()}-${brandHandles.join()}`}
            fallback={<SkeletonProductGrid />}
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
              optionValueIds={optionValueIds}
              categoryIds={selectedCategories.map((c) => c.id)}
              collectionIds={selectedBrands.map((b) => b.id)}
              viewMode={viewMode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
