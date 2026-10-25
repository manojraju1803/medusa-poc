import { listProducts } from "@lib/data/products"
import { getWarehouseAvailability } from "@lib/data/warehouses"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { CARD_FIELDS } from "@modules/products/lib/fields"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { AvailabilityMap } from "types/warehouse"

type Filters = {
  category_id?: string[]
  collection_id?: string[]
  id?: string[]
  option_value_id?: string[]
}

/**
 * One page of products for listing cards, with card fields (brand, MOQ, HSN).
 * The store API can't sort by price, so price sorts fetch everything first.
 *
 * `warehouseId` narrows the listing to what that warehouse carries. With
 * `withAvailability` (approved buyers only, as stock is gated like prices),
 * out-of-stock products go after in-stock ones across the whole listing, which
 * also needs everything first, and the page's availability is returned.
 */
export const listCardProducts = async ({
  page,
  limit,
  sortBy,
  countryCode,
  filters,
  warehouseId,
  withAvailability = false,
}: {
  page: number
  limit: number
  sortBy: SortOptions
  countryCode: string
  filters: Filters
  warehouseId?: string
  withAvailability?: boolean
}): Promise<{
  products: HttpTypes.StoreProduct[]
  count: number
  availability: AvailabilityMap
}> => {
  // Only non-empty filters go into the query.
  const base = {
    ...Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v && v.length)
    ),
    fields: CARD_FIELDS,
  }
  const sortsByPrice = sortBy === "price_asc" || sortBy === "price_desc"
  // ids are time-ordered and unique; imported products share created_at
  const order = sortBy === "title_asc" ? "title" : "-id"
  const availabilityAt = withAvailability ? warehouseId : undefined

  if (!sortsByPrice && !availabilityAt) {
    const { response } = await listProducts({
      pageParam: page,
      countryCode,
      warehouseId,
      queryParams: { ...base, limit, order },
    })
    return { ...response, availability: {} }
  }

  const all: HttpTypes.StoreProduct[] = []
  let next: number | null = 1
  while (next) {
    const { response, nextPage } = await listProducts({
      pageParam: next,
      countryCode,
      warehouseId,
      queryParams: { ...base, limit: 100, order: sortsByPrice ? "id" : order },
    })
    all.push(...response.products)
    next = nextPage
  }

  const sorted = sortsByPrice ? sortProducts(all, sortBy) : all
  const availability = availabilityAt
    ? await getWarehouseAvailability(
        availabilityAt,
        sorted.map((p) => p.id)
      )
    : {}
  const offset = (page - 1) * limit
  const products = inStockFirst(sorted, availability).slice(
    offset,
    offset + limit
  )

  return {
    products,
    count: all.length,
    availability: Object.fromEntries(
      products.map((p) => [p.id, availability[p.id]])
    ),
  }
}

// Moves out-of-stock products after the rest, keeping each group's order.
// A product with no availability answer counts as in stock.
const inStockFirst = (
  products: HttpTypes.StoreProduct[],
  availability: AvailabilityMap
) => {
  const isOut = (p: HttpTypes.StoreProduct) =>
    availability[p.id]?.in_stock === false
  return [...products.filter((p) => !isOut(p)), ...products.filter(isOut)]
}
