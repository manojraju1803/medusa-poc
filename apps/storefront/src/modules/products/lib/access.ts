import { HttpTypes } from "@medusajs/types"
import { PriceTier } from "types/global"

// Who is looking: guests and unapproved customers never get prices or stock.
export type Viewer = "guest" | "pending" | "approved"

// The backend strips `calculated_price` for anyone outside the Approved group,
// so a priced variant is the signal that this viewer is approved.
export const hasPrice = (product?: HttpTypes.StoreProduct | null) =>
  !!product?.variants?.some(
    (v) => v.calculated_price?.calculated_amount != null
  )

export const viewerFor = (
  customer: HttpTypes.StoreCustomer | null,
  products: (HttpTypes.StoreProduct | null | undefined)[]
): Viewer => {
  if (!customer) return "guest"
  return products.some(hasPrice) ? "approved" : "pending"
}

// Stock is not filtered by the backend, so drop it before anything reaches a
// client component (and so the page source) for a non-approved viewer.
export const withoutStock = (
  product: HttpTypes.StoreProduct
): HttpTypes.StoreProduct => ({
  ...product,
  variants:
    product.variants?.map((v) => {
      const { inventory_quantity: _hidden, ...rest } = v
      return rest as HttpTypes.StoreProductVariant
    }) ?? null,
})

export const forViewer = (product: HttpTypes.StoreProduct, viewer: Viewer) =>
  viewer === "approved" ? product : withoutStock(product)

export const hsnOf = (product: HttpTypes.StoreProduct) => {
  const hsn = product.metadata?.hsn_code
  return typeof hsn === "string" && hsn ? hsn : undefined
}

// "Save X% at N+ kg": best slab against the first slab.
export const tierSaving = (tiers?: PriceTier[]) => {
  if (!tiers || tiers.length < 2) return undefined
  const first = tiers[0]
  const best = tiers.reduce((a, b) => (b.unit_amount < a.unit_amount ? b : a))
  if (!first.unit_amount || best.unit_amount >= first.unit_amount) return
  const percent = Math.round(
    ((first.unit_amount - best.unit_amount) / first.unit_amount) * 100
  )
  return percent > 0 ? { percent, from: best.from } : undefined
}

export const UNIT = "kg"
