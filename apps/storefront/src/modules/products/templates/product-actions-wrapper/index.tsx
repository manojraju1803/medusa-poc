import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"
import { retrieveCart } from "@lib/data/cart"
import { listPriceTiers } from "@lib/data/price-tiers"
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
  const [product, priceTiers, cart] = await Promise.all([
    listProducts({ queryParams: { id: [id] }, regionId: region.id }).then(
      ({ response }) => response.products[0],
    ),
    approved
      ? listPriceTiers({ productIds: [id], regionId: region.id })
      : Promise.resolve([]),
    approved ? retrieveCart(undefined, "id,metadata") : Promise.resolve(null),
  ])
  if (!product) {
    return null
  }

  return (
    <ProductActions
      product={forViewer(product, viewer)}
      region={region}
      viewer={viewer}
      priceTiers={approved ? priceTiers : []}
      cart={cart ? { id: cart.id, metadata: cart.metadata } : null}
    />
  )
}
