"use server"

import { sdk } from "@lib/config"

export type SearchSuggestionProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  brand_name?: string | null
}

/**
 * Fetches lightweight product suggestions matching product name or brand.
 * Starting from 3 characters.
 * Suggestions contain ONLY product name, handle, image and optional brand name.
 * Strictly NO pricing information is returned.
 */
export async function getSearchSuggestions(
  query: string,
  limit = 8
): Promise<SearchSuggestionProduct[]> {
  const trimmed = query ? query.trim() : ""
  if (!trimmed || trimmed.length < 3) {
    return []
  }

  try {
    const data = await sdk.client.fetch<{
      products: SearchSuggestionProduct[]
    }>(`/store/search-suggestions`, {
      method: "GET",
      query: {
        q: trimmed,
        limit,
      },
      cache: "no-store",
    })

    return (data.products || []).map((p) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      thumbnail: p.thumbnail ?? null,
      brand_name: p.brand_name ?? null,
    }))
  } catch (_error) {
    // Fallback if search-suggestions custom route is unreachable
    try {
      const fallback = await sdk.client.fetch<{
        products: {
          id: string
          title: string
          handle: string
          thumbnail: string | null
        }[]
      }>(`/store/products`, {
        method: "GET",
        query: {
          q: trimmed,
          limit,
          fields: "id,title,handle,thumbnail",
        },
        cache: "no-store",
      })

      return (fallback.products || []).map((p) => ({
        id: p.id,
        title: p.title,
        handle: p.handle,
        thumbnail: p.thumbnail ?? null,
      }))
    } catch {
      return []
    }
  }
}
