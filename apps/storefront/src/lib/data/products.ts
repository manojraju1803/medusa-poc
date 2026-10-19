"use server"

import { sdk } from "@lib/config"
import { PRODUCT_CARD_FIELDS } from "@lib/util/product"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

type ProductListQueryParams = (HttpTypes.FindParams &
  HttpTypes.StoreProductListParams) & {
  options?: string[]
  option_value_id?: string | string[]
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: ProductListQueryParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+variants.metadata,+metadata,+tags,",
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
  optionValueIds,
}: {
  page?: number
  queryParams?: ProductListQueryParams
  sortBy?: SortOptions
  countryCode: string
  optionValueIds?: OptionValueIds
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  const limit = queryParams?.limit || 12
  const optionFilters = Array.from(
    new Set((optionValueIds || []).filter(Boolean))
  )

  const baseParams = {
    ...queryParams,
    ...(optionFilters.length ? { option_value_id: optionFilters } : {}),
    fields: PRODUCT_CARD_FIELDS,
  }

  if (sortBy === "created_at") {
    // ids are time-ordered and unique; imported products share created_at, which breaks paging
    const { response, nextPage } = await listProducts({
      pageParam: page,
      queryParams: { ...baseParams, limit, order: "-id" },
      countryCode,
    })

    return { response, nextPage, queryParams }
  }

  // the store api can't sort by price, so fetch everything and sort here
  const products: HttpTypes.StoreProduct[] = []
  let nextBatch: number | null = 1

  while (nextBatch) {
    const { response, nextPage } = await listProducts({
      pageParam: nextBatch,
      queryParams: { ...baseParams, limit: 100, order: "id" },
      countryCode,
    })
    products.push(...response.products)
    nextBatch = nextPage
  }

  const sortedProducts = sortProducts(products, sortBy)
  const offset = (page - 1) * limit

  return {
    response: {
      products: sortedProducts.slice(offset, offset + limit),
      count: products.length,
    },
    nextPage: products.length > offset + limit ? page + 1 : null,
    queryParams,
  }
}
