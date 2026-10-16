import "server-only"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import { HttpTypes } from "@medusajs/types"

// Asks the backend, which checks membership of the `Approved` group.
export async function isCustomerApproved(): Promise<boolean> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) return false

  return sdk.client
    .fetch<{ approved: boolean }>("/store/customers/me/approval", {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ approved }) => approved)
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
