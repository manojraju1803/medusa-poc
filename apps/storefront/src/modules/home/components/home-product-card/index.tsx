import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PreviewPrice from "@modules/products/components/product-preview/price"

export type PriceAccess = "guest" | "pending" | "approved"

const moqOf = (product: HttpTypes.StoreProduct) => {
  const values = (product.variants ?? [])
    .map((v) => Number(v.metadata?.min_quantity))
    .filter((n) => Number.isFinite(n) && n > 0)
  return values.length ? Math.min(...values) : null
}

const HomeProductCard = ({
  product,
  access,
  badge,
}: {
  product: HttpTypes.StoreProduct
  access: PriceAccess
  badge?: string
}) => {
  // Prices only exist on the product when the backend let them through
  // (approved customers); nothing here derives a price on its own.
  const { cheapestPrice } = getProductPrice({ product })
  const moq = moqOf(product)
  const brand = product.collection?.title

  return (
    <div
      className="h-full bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-[#006B4F]/25 hover:shadow-lg transition-all flex flex-col group"
      data-testid="product-wrapper"
    >
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="relative block aspect-[4/3] bg-white border-b border-gray-100"
      >
        {product.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnail}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-contain p-3 group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#f7faf9] text-xs text-[#64748b]">
            No image
          </div>
        )}
        {badge && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-bold bg-[#006B4F] text-white rounded">
            {badge}
          </span>
        )}
      </LocalizedClientLink>
      <div className="p-4 flex flex-col flex-1">
        <LocalizedClientLink href={`/products/${product.handle}`}>
          <h3
            className="font-bold text-[#0f172a] text-sm leading-snug mb-0.5 group-hover:text-[#006B4F] transition-colors line-clamp-2"
            data-testid="product-title"
          >
            {product.title}
          </h3>
        </LocalizedClientLink>
        {brand && (
          <LocalizedClientLink
            href={`/collections/${product.collection?.handle}`}
            className="text-[11px] text-[#0757a8] hover:underline"
          >
            {brand}
          </LocalizedClientLink>
        )}

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 my-3 text-[11px]">
          {moq !== null && (
            <div>
              <span className="text-[#9ca3af] block">MOQ</span>
              <span className="font-semibold text-[#374151]">{moq}</span>
            </div>
          )}
          <div>
            <span className="text-[#9ca3af] block">Price</span>
            {access === "approved" && cheapestPrice ? (
              <div className="flex flex-wrap gap-x-1 font-semibold [&_p]:text-[12px] [&_p]:leading-snug [&_[data-testid=price]]:text-[#006B4F]">
                <PreviewPrice price={cheapestPrice} />
              </div>
            ) : access === "approved" ? (
              <span className="font-semibold text-[#374151]">On request</span>
            ) : access === "pending" ? (
              <span className="font-semibold text-amber-700">
                Awaiting approval
              </span>
            ) : (
              <LocalizedClientLink
                href="/account"
                className="font-semibold text-[#0757a8] hover:underline"
              >
                Login to view price
              </LocalizedClientLink>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-auto">
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="flex-1 py-2 text-center text-xs font-semibold bg-[#006B4F] hover:bg-[#005a42] text-white rounded-lg transition-colors"
          >
            View Details
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default HomeProductCard
