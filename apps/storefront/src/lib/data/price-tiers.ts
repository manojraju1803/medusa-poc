"use server"

import { sdk } from "@lib/config"
import { VariantPriceTiers } from "types/global"
import { getAuthHeaders, getCacheOptions } from "./cookies"

/**
 * The signed-in customer's quantity slabs for each variant of the given
 * products. Empty for customers who aren't approved to see prices.
 */
export const listPriceTiers = async ({
  productIds,
  regionId,
}: {
  productIds: string[]
  regionId: string
}): Promise<VariantPriceTiers[]> => {
  // Sorted and de-duplicated, so the cached response doesn't depend on the
  // order of the cart's items.
  const ids = Array.from(new Set(productIds)).sort()
  if (!ids.length) {
    return []
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  // Shares the products tag, which login and signout already revalidate.
  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ variants: VariantPriceTiers[] }>(`/store/price-tiers`, {
      method: "GET",
      query: { product_id: ids, region_id: regionId },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ variants }) => variants)
    .catch(() => [])
}
