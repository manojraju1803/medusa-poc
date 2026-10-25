import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRightIcon } from "@modules/layout/components/ib-icons"
import CompareToggle from "@modules/products/components/compare-toggle"
import PreviewPrice from "@modules/products/components/product-preview/price"

export type PriceAccess = "guest" | "pending" | "approved"

const moqOf = (product: HttpTypes.StoreProduct) => {
  const values = (product.variants ?? [])
    .map((v) => Number(v.metadata?.min_quantity))
    .filter((n) => Number.isFinite(n) && n > 0)
  return values.length ? Math.min(...values) : null
}

// Each home-page row gets its own badge colour.
const BADGE_STYLES: Record<string, string> = {
  Featured: "bg-[#0077cf] text-white",
  New: "bg-[#7aba0c] text-[#00254d]",
  Trending: "bg-[#f97316] text-white",
}

const LockIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

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
  const href = `/products/${product.handle}`

  return (
    <div
      className="relative h-full bg-white border-2 border-[#dcebc6] rounded-2xl overflow-hidden shadow-[0_4px_14px_rgba(12,59,94,0.08)] hover:shadow-[0_16px_34px_rgba(77,124,15,0.18)] hover:-translate-y-1 hover:border-[#7aba0c] transition-all duration-300 flex flex-col group"
      data-testid="product-wrapper"
    >
      {/* Logo green-to-blue band. */}
      <span className="h-1.5 shrink-0 bg-gradient-to-r from-[#7aba0c] via-[#3d996e] to-[#0077cf]" />

      <LocalizedClientLink
        href={href}
        className="relative block aspect-[4/3] m-2.5 mb-0 rounded-xl overflow-hidden border border-[#e6f2d6] bg-gradient-to-br from-[#f6fbee] via-white to-[#eaf5fc]"
      >
        {product.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnail}
            alt={product.title}
            loading="lazy"
            className="relative w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-[#4d7c0f]/40">
            {product.title?.slice(0, 2).toUpperCase()}
          </div>
        )}
        {badge && (
          <span
            className={`absolute top-2.5 left-2.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full shadow-sm ${
              BADGE_STYLES[badge] ?? "bg-[#4d7c0f] text-white"
            }`}
          >
            {badge}
          </span>
        )}
      </LocalizedClientLink>

      <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
        {brand && (
          <LocalizedClientLink
            href={`/collections/${product.collection?.handle}`}
            className="self-start mb-1.5 px-2 py-0.5 rounded-md bg-[#eaf5fc] text-[10px] font-bold uppercase tracking-wide text-[#0077cf] hover:bg-[#d6ecf9] transition-colors"
          >
            {brand}
          </LocalizedClientLink>
        )}
        <LocalizedClientLink href={href}>
          <h3
            className="font-bold text-[#0f172a] text-[15px] leading-snug group-hover:text-[#4d7c0f] transition-colors line-clamp-2 min-h-[2.6em]"
            data-testid="product-title"
          >
            {product.title}
          </h3>
        </LocalizedClientLink>

        <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
          <div className="px-3 py-2 rounded-lg bg-[#f6fbee] border-l-[3px] border-[#7aba0c]">
            <span className="text-[#64748b] block font-medium">MOQ</span>
            <span className="font-bold text-[#334155]">{moq ?? "—"}</span>
          </div>
          <div className="px-3 py-2 min-w-0 rounded-lg bg-[#eaf5fc] border-l-[3px] border-[#0077cf]">
            <span className="text-[#64748b] block font-medium">Price</span>
            {access === "approved" && cheapestPrice ? (
              <div className="flex flex-wrap gap-x-1 font-bold [&_p]:text-[13px] [&_p]:leading-snug [&_[data-testid=price]]:text-[#4d7c0f]">
                <PreviewPrice price={cheapestPrice} />
              </div>
            ) : access === "approved" ? (
              <span className="font-bold text-[#334155]">On request</span>
            ) : access === "pending" ? (
              <span className="font-semibold text-amber-700">Awaiting approval</span>
            ) : (
              <LocalizedClientLink
                href="/account"
                className="inline-flex items-center gap-1 font-bold text-[#0077cf] hover:underline"
              >
                <LockIcon /> Login to view
              </LocalizedClientLink>
            )}
          </div>
        </div>

      </div>

      <div className="px-4 pt-3 pb-4 border-t border-[#e6f2d6] bg-[#fafdf5]">
        <div className="flex items-center gap-2 mb-3 text-[11px]">
          <CompareToggle productId={product.id} />
          <span className="text-gray-200">|</span>
          <LocalizedClientLink
            href={`${href}#inquiry`}
            className="text-[#4d7c0f] hover:text-[#3f6212] font-semibold"
          >
            Request Sample
          </LocalizedClientLink>
        </div>
        <div className="flex gap-2">
          <LocalizedClientLink
            href={`${href}#inquiry`}
            className="flex-1 py-2.5 text-center text-xs font-bold bg-[#4d7c0f] hover:bg-[#3f6212] text-white rounded-xl shadow-sm transition-colors"
          >
            Request Quote
          </LocalizedClientLink>
          <LocalizedClientLink
            href={href}
            aria-label={`Details for ${product.title}`}
            className="w-10 flex items-center justify-center bg-white border border-[#0077cf]/30 text-[#0077cf] hover:bg-[#0077cf] hover:text-white rounded-xl transition-colors"
          >
            <ArrowRightIcon className="w-4 h-4" />
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default HomeProductCard
