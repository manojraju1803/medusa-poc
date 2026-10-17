import { StorePrice } from "@medusajs/types"

export type FeaturedProduct = {
  id: string
  title: string
  handle: string
  thumbnail?: string
}

export type VariantPrice = {
  calculated_price_number: number
  calculated_price: string
  original_price_number: number
  original_price: string
  currency_code: string
  price_type: string
  percentage_diff: string
}

export type StoreFreeShippingPrice = StorePrice & {
  target_reached: boolean
  target_remaining: number
  remaining_percentage: number
}

// One quantity slab from GET /store/price-tiers. `to` is null for "and above".
export type PriceTier = {
  from: number
  to: number | null
  unit_amount: number
}

export type VariantPriceTiers = {
  variant_id: string
  min_quantity: number
  currency_code: string
  tiers: PriceTier[]
}
