import { HttpTypes } from "@medusajs/types"

export const PRODUCT_CARD_FIELDS =
  "id,title,subtitle,description,handle,thumbnail,created_at,origin_country,material,*tags,*metadata,*images,*variants,*variants.inventory_items.inventory.location_levels,*variants.inventory_quantity,*variants.calculated_price"

export const isSimpleProduct = (product: HttpTypes.StoreProduct): boolean => {
  return product.options?.length === 1 && product.options[0].values?.length === 1
}

/**
 * Extracts live available quantity for a variant from location_levels or inventory_quantity
 */
export const getVariantInventoryQuantity = (
  variant?: HttpTypes.StoreProductVariant | null
): number | undefined => {
  if (!variant) return undefined

  if (typeof variant.inventory_quantity === "number") {
    return variant.inventory_quantity
  }

  // Check inventory_items location_levels if populated
  const invItems = (variant as any).inventory_items
  if (Array.isArray(invItems) && invItems.length > 0) {
    let totalAvail = 0
    let hasLocationLevels = false
    for (const item of invItems) {
      const locLevels = item?.inventory?.location_levels
      if (Array.isArray(locLevels) && locLevels.length > 0) {
        for (const lvl of locLevels) {
          hasLocationLevels = true
          if (typeof lvl.available_quantity === "number") {
            totalAvail += lvl.available_quantity
          } else if (typeof lvl.stocked_quantity === "number") {
            const reserved =
              typeof lvl.reserved_quantity === "number" ? lvl.reserved_quantity : 0
            totalAvail += Math.max(0, lvl.stocked_quantity - reserved)
          }
        }
      }
    }
    if (hasLocationLevels) {
      return totalAvail
    }
  }

  return undefined
}

/**
 * Computes total stock across all variants of a product
 */
export const getProductTotalInventory = (
  product?: HttpTypes.StoreProduct | null
): number => {
  if (!product || !product.variants) return 0
  return product.variants.reduce((sum, v) => {
    const qty = getVariantInventoryQuantity(v)
    return sum + (qty !== undefined ? qty : 0)
  }, 0)
}

/**
 * Evaluates whether a product is currently available / in stock
 * based on Medusa inventory levels, availability flags, and catalog descriptions.
 */
export const isProductInStock = (
  product: HttpTypes.StoreProduct | null | undefined,
  selectedVariant?: HttpTypes.StoreProductVariant | null
): boolean => {
  if (!product) return false

  // 1. Explicit metadata out of stock flag on product
  if (
    product.metadata?.out_of_stock === true ||
    product.metadata?.in_stock === false ||
    product.metadata?.stock_status === "out_of_stock"
  ) {
    return false
  }

  // 2. Check if product description contains "Not Available Yet", "Not Available", "Out of stock", "Discontinued"
  const desc = (product.description || "").toLowerCase()
  if (
    desc.includes("not available") ||
    desc.includes("out of stock") ||
    desc.includes("discontinued")
  ) {
    return false
  }

  // 3. If a specific variant is selected, check its availability
  if (selectedVariant) {
    if (
      selectedVariant.metadata?.out_of_stock === true ||
      selectedVariant.metadata?.in_stock === false
    ) {
      return false
    }
    const qty = getVariantInventoryQuantity(selectedVariant)
    if (
      qty !== undefined &&
      qty <= 0 &&
      selectedVariant.manage_inventory &&
      !selectedVariant.allow_backorder
    ) {
      return false
    }
    return true
  }

  // 4. If no specific variant selected, check if any variant is valid and available
  if (product.variants && product.variants.length > 0) {
    const hasAvailableVariant = product.variants.some((v) => {
      if (v.metadata?.out_of_stock === true || v.metadata?.in_stock === false) {
        return false
      }
      const qty = getVariantInventoryQuantity(v)
      if (
        qty !== undefined &&
        qty <= 0 &&
        v.manage_inventory &&
        !v.allow_backorder
      ) {
        return false
      }
      return true
    })

    if (!hasAvailableVariant) {
      return false
    }
  }

  return true
}