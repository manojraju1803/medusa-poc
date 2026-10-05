import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]
  const visited = new Set<string>()

  const getParents = (cat: HttpTypes.StoreProductCategory) => {
    if (cat.parent_category && cat.parent_category.id && !visited.has(cat.parent_category.id)) {
      visited.add(cat.parent_category.id)
      parents.push(cat.parent_category)
      getParents(cat.parent_category)
    }
  }

  getParents(category)

  const productCount = category.products?.length || 0

  return (
    <div className="bg-[#fcfdfd] min-h-screen">
      {/* Breadcrumb Navigation Bar */}
      <div className="border-b border-[#BAE6FD] bg-[#F0F9FF]">
        <div className="content-container py-3 text-xs text-[#475569] flex items-center gap-2 flex-wrap font-medium">
          <LocalizedClientLink href="/" className="hover:text-[#1C94D2] transition-colors">
            Home
          </LocalizedClientLink>
          <span className="text-[#94a3b8]">/</span>
          <LocalizedClientLink href="/store" className="hover:text-[#1C94D2] transition-colors">
            Product Catalog
          </LocalizedClientLink>
          {parents.map((parent) => (
            <span key={parent.id} className="flex items-center gap-2">
              <span className="text-[#94a3b8]">/</span>
              <LocalizedClientLink
                className="hover:text-[#1C94D2] transition-colors"
                href={`/categories/${parent.handle}`}
              >
                {parent.name}
              </LocalizedClientLink>
            </span>
          ))}
          <span className="text-[#94a3b8]">/</span>
          <span className="text-[#0F172A] font-bold">
            {category.name}
          </span>
        </div>
      </div>

      {/* Main Category Content Area */}
      <div
        className="content-container py-8"
        data-testid="category-container"
      >
        {/* Category Header Hero Card */}
        <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#F0F9FF] via-white to-[#F4FBEA] border-2 border-[#BAE6FD] shadow-xs">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1
                className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight"
                data-testid="category-page-title"
              >
                {category.name}
              </h1>
              {productCount > 0 && (
                <span className="text-xs font-bold text-[#15803D] bg-[#F4FBEA] border border-[#D4EDAB] px-3 py-1 rounded-full shadow-2xs">
                  {productCount} Verified Items
                </span>
              )}
            </div>

            {/* Quality Assurance Strip */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0369A1]">
              <span className="bg-white px-2.5 py-1 rounded-lg border border-[#BAE6FD] shadow-2xs">
                ✓ Batch Tested CoA
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-[#D4EDAB] text-[#15803D] shadow-2xs">
                🌱 100% Pure & Traceable
              </span>
            </div>
          </div>

          {category.description ? (
            <p className="text-sm text-[#334155] max-w-3xl leading-relaxed font-normal">
              {category.description}
            </p>
          ) : (
            <p className="text-sm text-[#334155] max-w-3xl leading-relaxed font-normal">
              Lab-certified, bulk industrial raw ingredients sourced directly from verified manufacturers with batch Certificate of Analysis (CoA) and pan-India logistics.
            </p>
          )}

          {/* Subcategory Filter Pills / Chips */}
          {category.category_children && category.category_children.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#0F172A] mr-1">Subcategories:</span>
              {category.category_children.map((c) => (
                <LocalizedClientLink
                  key={c.id}
                  href={`/categories/${c.handle}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F0F9FF] border border-gray-200 hover:border-[#1C94D2] text-xs font-semibold text-[#0F172A] hover:text-[#1C94D2] hover:-translate-y-0.5 transition-all shadow-2xs"
                >
                  <span>{c.name}</span>
                  {c.products?.length ? (
                    <span className="text-[10px] text-[#0369A1] bg-[#EBF6FC] px-1.5 py-0.5 rounded-full font-bold">
                      {c.products.length}
                    </span>
                  ) : null}
                  <span className="text-[11px] text-[#94a3b8]">↗</span>
                </LocalizedClientLink>
              ))}
            </div>
          )}
        </div>

        {/* 2-Column Catalog Grid (Sidebar Filters + Products Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar: Refinement & Sort Card */}
          <div className="lg:col-span-3 lg:sticky lg:top-24">
            <RefinementList
              sortBy={sort}
              data-testid="sort-by-container"
              hideOptionsPicker
            />
          </div>

          {/* Right Area: Paginated Products Grid */}
          <div className="lg:col-span-9 w-full">
            <Suspense
              fallback={
                <SkeletonProductGrid
                  numberOfProducts={category.products?.length ?? 8}
                />
              }
            >
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                categoryId={category.id}
                countryCode={countryCode}
                optionValueIds={optionValueIds}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
