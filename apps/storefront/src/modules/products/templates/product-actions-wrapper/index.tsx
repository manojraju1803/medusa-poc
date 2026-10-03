import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"
import { retrieveCustomer } from "@lib/data/customer"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  try {
    const [product, customer] = await Promise.all([
      listProducts({ queryParams: { id: [id] }, regionId: region?.id })
        .then(({ response }) => response?.products?.[0])
        .catch(() => null),
      retrieveCustomer().catch(() => null),
    ])
    if (!product) {
      return null
    }

    return (
      <ProductActions product={product} region={region} isLoggedIn={!!customer} />
    )
  } catch {
    return null
  }
}

