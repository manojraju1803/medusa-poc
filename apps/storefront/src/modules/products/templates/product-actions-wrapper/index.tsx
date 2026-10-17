import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"
import { retrieveCustomer } from "@lib/data/customer"
import { listPriceTiers } from "@lib/data/price-tiers"

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
    const [product, customer, priceTiers] = await Promise.all([
      listProducts({ queryParams: { id: [id] }, regionId: region?.id })
        .then(({ response }) => response?.products?.[0])
        .catch(() => null),
      retrieveCustomer().catch(() => null),
      listPriceTiers({ productIds: [id], regionId: region?.id }).catch(
        () => []
      ),
    ])
    if (!product) {
      return null
    }

    const isApproved =
      !!product.variants?.some((v) => !!v.calculated_price) ||
      !!(
        customer as (HttpTypes.StoreCustomer & { groups?: { name?: string }[] }) | null
      )?.groups?.some((g: { name?: string }) => g.name === "Approved")

    return (
      <ProductActions
        product={product}
        region={region}
        isLoggedIn={!!customer}
        isApproved={isApproved}
        priceTiers={priceTiers}
      />
    )
  } catch {
    return null
  }
}

