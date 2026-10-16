import "server-only"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"

// The order's metadata (payment_term, copied from the cart at checkout).
// `retrieveOrder` doesn't request it, so it is fetched on its own here.
export const retrieveOrderMetadata = async (id: string) =>
  sdk.client
    .fetch<{ order: { metadata?: Record<string, unknown> | null } }>(
      `/store/orders/${id}`,
      {
        query: { fields: "id,metadata" },
        headers: { ...(await getAuthHeaders()) },
        cache: "no-store",
      }
    )
    .then(({ order }) => order.metadata ?? null)
    .catch(() => null)
