import { retrieveCustomer } from "@lib/data/customer"
import { listProducts } from "@lib/data/products"
import { wishlistOf } from "@lib/data/wishlist"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCard from "@modules/products/components/product-card"
import { viewerFor } from "@modules/products/lib/access"
import { CARD_FIELDS } from "@modules/products/lib/fields"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Ingredients you saved for later.",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function WishlistPage(props: Props) {
  const { countryCode } = await props.params
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  const ids = await wishlistOf(customer)
  const products = ids.length
    ? await listProducts({
        countryCode,
        queryParams: { id: ids, limit: 100, fields: CARD_FIELDS },
      }).then(({ response }) => response.products)
    : ([] as HttpTypes.StoreProduct[])
  const viewer = viewerFor(customer, products)

  return (
    <div className="w-full" data-testid="wishlist-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-2">
        <h1 className="text-2xl-semi">Wishlist</h1>
        <p className="text-base-regular">
          Ingredients you saved. Tap the heart again to remove one.
        </p>
      </div>
      {products.length === 0 ? (
        <div className="bg-[#fafdf5] border border-[#e6f2d6] rounded-xl p-10 text-center">
          <p className="text-sm text-[#64748b] mb-4">Your wishlist is empty.</p>
          <LocalizedClientLink
            href="/store"
            className="inline-block px-4 py-2 bg-[#4d7c0f] hover:bg-[#3f6212] text-white text-sm font-semibold rounded-lg"
          >
            Browse ingredients
          </LocalizedClientLink>
        </div>
      ) : (
        <ul className="grid grid-cols-2 small:grid-cols-3 gap-4" data-testid="wishlist-list">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} viewer={viewer} wishlisted />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
