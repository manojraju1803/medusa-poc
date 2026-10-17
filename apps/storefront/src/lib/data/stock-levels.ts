"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type StockLevel = {
  location_id: string
  name: string
  city: string
  stocked_quantity: number
}

/**
 * Stock per warehouse for one variant. Approved customers only (the backend
 * answers 403 otherwise); empty on any error.
 */
export const listStockLevels = async (
  variantId: string
): Promise<StockLevel[]> => {
  if (!variantId) return []
  return sdk.client
    .fetch<{ levels: StockLevel[] }>(`/store/stock-levels`, {
      method: "GET",
      query: { variant_id: variantId },
      headers: { ...(await getAuthHeaders()) },
      cache: "no-store",
    })
    .then(({ levels }) => levels ?? [])
    .catch(() => [])
}
