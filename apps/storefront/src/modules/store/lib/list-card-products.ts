import { listProducts } from "@lib/data/products"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { CARD_FIELDS } from "@modules/products/lib/fields"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Filters = {
  category_id?: string[]
  collection_id?: string[]
  id?: string[]
  option_value_id?: string[]
}

/**
 * One page of products for listing cards, with card fields (brand, MOQ, HSN).
 * The store API can't sort by price, so price sorts fetch everything first.
 */
export const listCardProducts = async ({
  page,
  limit,
  sortBy,
  countryCode,
  filters,
}: {
  page: number
  limit: number
  sortBy: SortOptions
  countryCode: string
  filters: Filters
}): Promise<{ products: HttpTypes.StoreProduct[]; count: number }> => {
  // Only non-empty filters go into the query.
  const base = {
    ...Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v && v.length)
    ),
    fields: CARD_FIELDS,
  }

  if (sortBy !== "price_asc" && sortBy !== "price_desc") {
    const { response } = await listProducts({
      pageParam: page,
      countryCode,
      queryParams: {
        ...base,
        limit,
        // ids are time-ordered and unique; imported products share created_at
        order: sortBy === "title_asc" ? "title" : "-id",
      },
    })
    return response
  }

  const all: HttpTypes.StoreProduct[] = []
  let next: number | null = 1
  while (next) {
    const { response, nextPage } = await listProducts({
      pageParam: next,
      countryCode,
      queryParams: { ...base, limit: 100, order: "id" },
    })
    all.push(...response.products)
    next = nextPage
  }
  const sorted = sortProducts(all, sortBy)
  const offset = (page - 1) * limit
  return { products: sorted.slice(offset, offset + limit), count: all.length }
}
