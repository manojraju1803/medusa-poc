import { HttpTypes } from "@medusajs/types"

// A variant's minimum order quantity, from `metadata.min_quantity`. The
// backend's minimum-quantity hooks enforce it; the storefront only mirrors it.
export const minQuantityOf = (variant?: HttpTypes.StoreProductVariant | null) => {
  const minimum = Number(variant?.metadata?.min_quantity)
  return Number.isFinite(minimum) && minimum > 0 ? minimum : 1
}
