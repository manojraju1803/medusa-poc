import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

// Shown while the filter options (categories, brands) load; the product grid
// then streams in behind its own skeleton.
export default function Loading() {
  return (
    <div className="bg-[#f8fffe] min-h-screen" data-testid="store-loading">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 flex flex-col gap-3">
          <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
          <div className="h-8 w-80 max-w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-12 w-[620px] max-w-full bg-gray-100 rounded-xl animate-pulse mt-2" />
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <SkeletonProductGrid numberOfProducts={12} />
      </div>
    </div>
  )
}
