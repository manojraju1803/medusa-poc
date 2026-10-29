import "server-only"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"

// Asks the backend, which checks membership of the `Approved` group. Kept
// uncached so an approval shows at once, but shared within one render via
// React's cache(), since a listing asks from several components.
const fetchApproval = cache(
  async (authorization: string): Promise<boolean> =>
    sdk.client
      .fetch<{ approved: boolean }>("/store/customers/me/approval", {
        method: "GET",
        headers: { authorization },
        cache: "no-store",
      })
      .then(({ approved }) => approved)
      .catch(() => false)
)

export async function isCustomerApproved(): Promise<boolean> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) return false

  return fetchApproval(headers.authorization)
}

export const accountTypeLabel = (customer: HttpTypes.StoreCustomer | null) => {
  const meta = (customer?.metadata || {}) as Record<string, unknown>
  if (meta.account_type === "supplier") return "Supplier"
  if (meta.account_type === "rnd") return "R&D"
  const buyerType = typeof meta.buyer_type === "string" ? meta.buyer_type : ""
  return buyerType
    ? `Buyer · ${buyerType.charAt(0).toUpperCase()}${buyerType.slice(1)}`
    : "Buyer"
}
