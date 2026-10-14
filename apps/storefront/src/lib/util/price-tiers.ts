import { PriceTier } from "types/global"

// Bounds are inclusive at both ends, matching the pricing engine.
export const findPriceTier = (
  tiers: PriceTier[] | undefined,
  quantity: number
) =>
  tiers?.find(
    (tier) => quantity >= tier.from && (tier.to == null || quantity <= tier.to)
  )

// How close counts as close: the units still to add are at most this share of
// the next slab's starting quantity (12 more for a 50 slab, 25 for a 100 slab).
const NEXT_TIER_WINDOW = 0.25

export type NextTierNudge = {
  addQuantity: number
  unitSaving: number
  // unitSaving across the whole line once it reaches the next slab
  totalSaving: number
}

/**
 * What a cart line gains by moving up to the next slab. Undefined when there is
 * no real saving to offer: the line is on the top slab, the next slab isn't
 * cheaper or is too far away, or the line isn't charged the slab price at all
 * (a custom price, or slab data older than the cart).
 */
export const getNextTierNudge = ({
  tiers,
  quantity,
  unitPrice,
  minQuantity,
}: {
  tiers: PriceTier[] | undefined
  quantity: number
  unitPrice: number
  minQuantity: number
}): NextTierNudge | undefined => {
  const current = findPriceTier(tiers, quantity)
  if (!current || current.to == null || current.unit_amount !== unitPrice) {
    return
  }

  // Where the next slab starts, but never below the minimum order quantity.
  const targetQuantity = Math.max(current.to + 1, minQuantity)
  const next = findPriceTier(tiers, targetQuantity)
  const addQuantity = targetQuantity - quantity

  if (
    !next ||
    next.unit_amount >= current.unit_amount ||
    addQuantity > targetQuantity * NEXT_TIER_WINDOW
  ) {
    return
  }

  const unitSaving = current.unit_amount - next.unit_amount
  return {
    addQuantity,
    unitSaving,
    totalSaving: unitSaving * targetQuantity,
  }
}

export const formatTierRange = (tier: PriceTier) => {
  if (tier.to == null) {
    return `${tier.from}+`
  }
  return tier.from === tier.to ? `${tier.from}` : `${tier.from}–${tier.to}`
}
