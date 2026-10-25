"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders } from "./cookies"

export type SearchSuggestionProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  brand_name?: string | null
}

// name + image only: no region_id, so the store API never computes a price
const SUGGESTION_FIELDS = "id,title,handle,thumbnail,collection.title"

const listSuggestionProducts = async (
  query: HttpTypes.StoreProductListParams,
  headers: Record<string, string>
) =>
  sdk.store.product
    .list({ ...query, fields: SUGGESTION_FIELDS }, headers)
    .then(({ products }) => products)

// Products matching the name, then products of matching brands (collections).
export async function getSearchSuggestions(
  query: string,
  limit = 8
): Promise<SearchSuggestionProduct[]> {
  const q = query.trim()
  if (q.length < 3) return []

  const headers = { ...(await getAuthHeaders()) }

  const [byName, brands] = await Promise.all([
    listSuggestionProducts({ q, limit }, headers),
    sdk.store.collection
      .list({ q, fields: "id", limit: 20 }, headers)
      .then(({ collections }) => collections),
  ])

  const byBrand = brands.length
    ? await listSuggestionProducts(
        { collection_id: brands.map((b) => b.id), limit },
        headers
      )
    : []

  const seen = new Set<string>()
  return [...byName, ...byBrand]
    .filter((p) => !seen.has(p.id) && seen.add(p.id))
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      title: p.title,
      handle: p.handle!,
      thumbnail: p.thumbnail ?? null,
      brand_name: p.collection?.title ?? null,
    }))
}
