import { getActiveWarehouse } from "@lib/data/active-warehouse"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"
import { retrieveCart } from "@lib/data/cart"
import { listPriceTiers } from "@lib/data/price-tiers"
import { StockLevel, listStockLevels } from "@lib/data/stock-levels"
import { Viewer, forViewer } from "@modules/products/lib/access"

/**
 * Loads the buyer-specific extras (price slabs, cart, stock per warehouse) and
 * renders the product actions. The product itself comes from the page, which
 * already fetched it with prices for this viewer, so it isn't requested again.
 * Prices, slabs and stock only reach the client for approved viewers.
 */
export default async function ProductActionsWrapper({
  product,
  region,
  viewer,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  viewer: Viewer
}) {
  const approved = viewer === "approved"
  const variantIds = (product.variants ?? []).map((v) => v.id)

  const [priceTiers, cart, activeWarehouse, levels] = await Promise.all([
    approved
      ? listPriceTiers({ productIds: [product.id], regionId: region.id })
      : Promise.resolve([]),
    approved ? retrieveCart(undefined, "id,metadata") : Promise.resolve(null),
    approved ? getActiveWarehouse() : Promise.resolve(null),
    // Stock per warehouse, per variant; fetched for approved viewers only.
    approved
      ? Promise.all(variantIds.map((vid) => listStockLevels(vid)))
      : Promise.resolve([] as StockLevel[][]),
  ])

  const stockLevels: Record<string, StockLevel[]> = {}
  variantIds.forEach((vid, i) => {
    if (levels[i]) stockLevels[vid] = levels[i]
  })

  // Open on the buyer's warehouse when this product has a chip for it.
  const buyerCity = activeWarehouse?.warehouse.city
  const initialCity = Object.values(stockLevels).some((levels) =>
    levels.some((l) => l.city === buyerCity)
  )
    ? buyerCity
    : undefined

  return (
    <ProductActions
      product={forViewer(product, viewer)}
      region={region}
      viewer={viewer}
      priceTiers={approved ? priceTiers : []}
      stockLevels={approved ? stockLevels : {}}
      initialCity={initialCity}
      cart={cart ? { id: cart.id, metadata: cart.metadata } : null}
    />
  )
}
