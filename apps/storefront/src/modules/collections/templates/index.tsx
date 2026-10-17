import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SupplierLogo from "@modules/suppliers/components/supplier-logo"
import { countCollectionProducts, toSupplier } from "@modules/suppliers/data"

// A collection is a brand / supplier, so this page is the supplier profile.
export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const supplier = toSupplier(
    collection,
    await countCollectionProducts(collection.id)
  )

  return (
    <div className="min-h-screen bg-[#f8fffe]" data-testid="supplier-profile">
      <div className="relative bg-[#0d3320] h-36 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/home-hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      </div>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm -mt-6 relative p-5 mb-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <SupplierLogo supplier={supplier} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-[#0f172a]">
                  {supplier.title}
                </h1>
                <span className="text-[10px] font-bold text-[#006B4F] bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-0.5 rounded-full">
                  Brand on Ingredients Bazar
                </span>
              </div>
              {supplier.country && (
                <p className="text-sm text-[#64748b]">{supplier.country}</p>
              )}
              {supplier.description && (
                <p className="text-sm text-[#374151] leading-relaxed mt-2 max-w-3xl">
                  {supplier.description}
                </p>
              )}
              <div className="flex flex-wrap gap-6 mt-3">
                <div>
                  <div className="text-base font-extrabold text-[#006B4F]">
                    {supplier.productCount}
                  </div>
                  <div className="text-[10px] text-[#64748b]">
                    {supplier.productCount === 1 ? "Product" : "Products"}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <LocalizedClientLink
                href={`/contact?subject=${encodeURIComponent(`Quote request: ${supplier.title}`)}`}
                className="px-4 py-2 bg-[#006B4F] text-white text-xs font-bold rounded-xl hover:bg-[#005a42] transition-colors"
              >
                Request Quote
              </LocalizedClientLink>
              <LocalizedClientLink
                href={`/contact?subject=${encodeURIComponent(`Sample request: ${supplier.title}`)}`}
                className="px-4 py-2 border border-[#006B4F]/40 text-[#006B4F] text-xs font-bold rounded-xl hover:bg-[#f0fdf4] transition-colors"
              >
                Request Sample
              </LocalizedClientLink>
              <LocalizedClientLink
                href={`/contact?subject=${encodeURIComponent(`Enquiry about ${supplier.title}`)}`}
                className="px-4 py-2 border border-gray-200 text-[#374151] text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Contact
              </LocalizedClientLink>
            </div>
          </div>
        </div>

        <div className="flex flex-col small:flex-row small:items-start pb-10">
          <RefinementList sortBy={sort} hideOptionsPicker />
          <div className="w-full">
            <h2 className="text-lg font-bold text-[#0f172a] mb-4">
              Products from {supplier.title}
            </h2>
            <Suspense
              fallback={
                <SkeletonProductGrid
                  numberOfProducts={collection.products?.length}
                />
              }
            >
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                collectionId={collection.id}
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
