import { Suspense } from "react"

import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  optionValueIds,
  q,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  q?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="bg-[#fcfdfd] min-h-screen">
      {/* Breadcrumb Navigation Bar */}
      <div className="border-b border-gray-100 bg-[#f8fffe]">
        <div className="content-container py-3 text-xs text-[#6b7280] flex items-center gap-1.5 flex-wrap">
          <LocalizedClientLink href="/" className="hover:text-[#1C94D2]">
            Home
          </LocalizedClientLink>
          <span>/</span>
          <span className="text-[#0f172a] font-semibold">
            {q ? "Search Results" : "Product Catalog"}
          </span>
        </div>
      </div>

      {/* Main Catalog Content */}
      <div className="content-container py-8" data-testid="category-container">
        <div className="mb-6">
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight"
            data-testid="store-page-title"
          >
            {q ? `Search results for "${q}"` : "All Products Catalog"}
          </h1>
          <p className="text-sm text-[#64748b] mt-1">
            Browse 370+ wholesale industrial raw ingredients with verified manufacturer sourcing, CoA compliance, and real-time inventory.
          </p>
        </div>

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar: Refinement & Sort Card */}
          <div className="lg:col-span-3 lg:sticky lg:top-24">
            <RefinementList sortBy={sort} />
          </div>

          {/* Right Area: Paginated Products Grid */}
          <div className="lg:col-span-9 w-full">
            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                countryCode={countryCode}
                optionValueIds={optionValueIds}
                q={q}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
