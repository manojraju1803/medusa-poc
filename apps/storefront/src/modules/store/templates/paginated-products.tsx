import { retrieveCustomer } from "@lib/data/customer"
import { getRegion } from "@lib/data/regions"
import { wishlistOf } from "@lib/data/wishlist"
import { OptionValueIds } from "@lib/util/product-option-filters"
import ProductCard from "@modules/products/components/product-card"
import { viewerFor } from "@modules/products/lib/access"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listCardProducts } from "@modules/store/lib/list-card-products"

const PRODUCT_LIMIT = 12

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  collectionIds,
  categoryIds,
  productsIds,
  countryCode,
  optionValueIds,
  viewMode = "grid",
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  collectionIds?: string[]
  categoryIds?: string[]
  productsIds?: string[]
  countryCode: string
  optionValueIds?: OptionValueIds
  viewMode?: "grid" | "list"
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const collection_id = [
    ...(collectionId ? [collectionId] : []),
    ...(collectionIds ?? []),
  ]
  const category_id = [
    ...(categoryId ? [categoryId] : []),
    ...(categoryIds ?? []),
  ]

  const [{ products, count }, customer] = await Promise.all([
    listCardProducts({
      page,
      limit: PRODUCT_LIMIT,
      sortBy: sortBy ?? "created_at",
      countryCode,
      filters: {
        collection_id,
        category_id,
        id: productsIds,
        option_value_id: optionValueIds,
      },
    }),
    retrieveCustomer(),
  ])

  const viewer = viewerFor(customer, products)
  const wishlist = await wishlistOf(customer)
  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  if (!products.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-16 text-center" data-testid="products-list">
        <h3 className="text-lg font-bold text-[#0f172a] mb-1">No ingredients found</h3>
        <p className="text-sm text-[#64748b]">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-[#64748b] mb-3" data-testid="result-count">
        <strong className="text-[#0f172a]">{count}</strong> ingredient{count === 1 ? "" : "s"}
      </p>
      <ul
        className={
          viewMode === "list"
            ? "flex flex-col gap-3 w-full"
            : "grid grid-cols-2 w-full xl:grid-cols-3 2xl:grid-cols-4 gap-4"
        }
        data-testid="products-list"
      >
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard
              product={p}
              viewer={viewer}
              wishlisted={wishlist.includes(p.id)}
              viewMode={viewMode}
            />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
