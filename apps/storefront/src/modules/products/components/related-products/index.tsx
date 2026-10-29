import { retrieveCustomer } from "@lib/data/customer"
import { listProducts } from "@lib/data/products"
import { wishlistOf } from "@lib/data/wishlist"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCard from "@modules/products/components/product-card"
import { Viewer } from "@modules/products/lib/access"
import { CARD_FIELDS } from "@modules/products/lib/fields"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  categoryIds: string[]
  countryCode: string
  viewer: Viewer
}

// Similar products: those sharing the most categories with this one.
export default async function RelatedProducts({
  product,
  categoryIds,
  countryCode,
  viewer,
}: RelatedProductsProps) {
  if (!categoryIds.length) {
    return null
  }

  const [candidates, customer] = await Promise.all([
    listProducts({
      countryCode,
      queryParams: {
        category_id: categoryIds,
        limit: 40,
        fields: `${CARD_FIELDS},categories.id`,
      },
    }).then(({ response }) => response.products),
    retrieveCustomer(),
  ])

  const wanted = new Set(categoryIds)
  const products = candidates
    .filter((p) => p.id !== product.id)
    .map((p) => ({
      p,
      overlap: p.categories?.filter((c) => wanted.has(c.id)).length ?? 0,
    }))
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 8)
    .map(({ p }) => p)

  if (!products.length) {
    return null
  }

  const wishlist = await wishlistOf(customer)

  return (
    <section
      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mt-6"
      data-testid="related-products-container"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#0f172a]">Similar Products</h2>
          <p className="text-xs text-[#64748b]">Related ingredients from the same category</p>
        </div>
        <LocalizedClientLink
          href="/store"
          className="px-4 py-2 border border-[#166534]/30 text-[#166534] text-xs font-bold rounded-lg hover:bg-[#f0fdf4]"
        >
          View All
        </LocalizedClientLink>
      </div>
      <ul className="flex gap-4 overflow-x-auto mt-4 pb-2">
        {products.map((p) => (
          <li key={p.id} className="w-56 shrink-0">
            <ProductCard
              product={p}
              viewer={viewer}
              wishlisted={wishlist.includes(p.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
