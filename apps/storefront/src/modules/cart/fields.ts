// The storefront's default cart fields plus the GST tax lines the cart and
// checkout summaries break down (CGST/SGST/IGST).
export const CART_FIELDS =
  "*items, *region, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name, *items.tax_lines, *shipping_methods.tax_lines, +metadata"
