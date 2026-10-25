import { getActiveWarehouse } from "@lib/data/active-warehouse"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"
import { retrieveCart } from "@lib/data/cart"
import { listPriceTiers } from "@lib/data/price-tiers"
import { StockLevel, listStockLevels } from "@lib/data/stock-levels"
import { Viewer, forViewer } from "@modules/products/lib/access"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 * Prices, slabs and stock only reach the client for approved viewers.
 */
export default async function ProductActionsWrapper({
  id,
  region,
  viewer,
}: {
  id: string
  region: HttpTypes.StoreRegion
  viewer: Viewer
}) {
  const approved = viewer === "approved"
  const [product, priceTiers, cart, activeWarehouse] = await Promise.all([
    listProducts({ queryParams: { id: [id] }, regionId: region.id }).then(
      ({ response }) => response.products[0],
    ),
    approved
      ? listPriceTiers({ productIds: [id], regionId: region.id })
      : Promise.resolve([]),
    approved ? retrieveCart(undefined, "id,metadata") : Promise.resolve(null),
    approved ? getActiveWarehouse() : Promise.resolve(null),
  ])
  if (!product) {
    return null
  }

  // Stock per warehouse, per variant; fetched for approved viewers only.
  const stockLevels: Record<string, StockLevel[]> = {}
  if (approved) {
    const ids = (product.variants ?? []).map((v) => v.id)
    const levels = await Promise.all(ids.map((vid) => listStockLevels(vid)))
    ids.forEach((vid, i) => (stockLevels[vid] = levels[i]))
  }

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
