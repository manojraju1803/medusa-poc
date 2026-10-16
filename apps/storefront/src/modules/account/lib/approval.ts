import "server-only"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"

// The store API won't return customer groups, so approval is read the same way
// the backend enforces it: only `Approved` customers get `calculated_price`.
export async function isCustomerApproved(): Promise<boolean> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) return false

  const region = await getRegion(process.env.NEXT_PUBLIC_DEFAULT_REGION || "in")
  if (!region) return false

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[] }>("/store/products", {
      method: "GET",
      query: {
        limit: 5,
        region_id: region.id,
        fields: "id,variants.id,*variants.calculated_price",
      },
      headers,
      cache: "no-store",
    })
    .then(({ products }) =>
      products.some((p) => p.variants?.some((v) => !!v.calculated_price))
    )
    .catch(() => false)
}

export const accountTypeLabel = (customer: HttpTypes.StoreCustomer | null) => {
  const meta = (customer?.metadata || {}) as Record<string, unknown>
  if (meta.account_type === "supplier") return "Supplier"
  const buyerType = typeof meta.buyer_type === "string" ? meta.buyer_type : ""
  return buyerType
    ? `Buyer · ${buyerType.charAt(0).toUpperCase()}${buyerType.slice(1)}`
    : "Buyer"
}
