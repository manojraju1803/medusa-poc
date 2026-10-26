import { getProductPrice } from "@lib/util/get-product-price"
import { isRealProductImageUrl } from "@lib/util/product-image"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPlaceholder from "@modules/common/icons/product-placeholder"
import CompareToggle from "@modules/products/components/compare-toggle"
import { UNIT, hsnOf } from "@modules/products/lib/access"

export type PriceAccess = "guest" | "pending" | "approved"

const moqOf = (product: HttpTypes.StoreProduct) => {
  const values = (product.variants ?? [])
    .map((v) => Number(v.metadata?.min_quantity))
    .filter((n) => Number.isFinite(n) && n > 0)
  return values.length ? Math.min(...values) : null
}

// Stock pill, approved buyers only, and only when the row was fetched with
// inventory quantities (untracked variants count as in stock).
const stockOf = (product: HttpTypes.StoreProduct) => {
  const variants = product.variants ?? []
  if (variants.some((v) => v.manage_inventory === false)) return "In Stock"
  const qty = variants
    .map((v) => v.inventory_quantity)
    .filter((n): n is number => typeof n === "number")
  if (!qty.length) return null
  const total = qty.reduce((a, b) => a + Math.max(b, 0), 0)
  if (total <= 0) return "Out of Stock"
  // Less than one minimum order left.
  return total < (moqOf(product) ?? 1) ? "Limited Stock" : "In Stock"
}

const STOCK_STYLES: Record<string, string> = {
  "In Stock": "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]",
  "Limited Stock": "bg-[#fffbeb] border-[#fde68a] text-[#b45309]",
  "Out of Stock": "bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]",
}

const LockIcon = () => (
  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const Spec = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <dt className="text-[11px] leading-4 text-[#9ca3af]">{label}</dt>
    <dd className="text-xs leading-5 font-semibold text-[#374151] truncate">{children}</dd>
  </div>
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
  const hsn = hsnOf(product)
  const brand = product.collection
  const stock = access === "approved" ? stockOf(product) : null
  const href = `/products/${product.handle}`
  const src = [product.thumbnail, ...(product.images?.map((i) => i.url) ?? [])].find(
    isRealProductImageUrl
  )

  const price =
    access === "approved" && cheapestPrice ? (
      <span className="text-[#166534]" data-testid="price">
        {(product.variants?.length ?? 0) > 1 && "From "}
        {cheapestPrice.calculated_price}
        <span className="font-normal text-[#6b7280]"> / {UNIT}</span>
      </span>
    ) : access === "approved" ? (
      "On request"
    ) : access === "pending" ? (
      <span className="text-amber-700">Awaiting approval</span>
    ) : (
      <LocalizedClientLink
        href="/account"
        className="inline-flex items-center gap-1 text-[#0077cf] hover:underline"
      >
        <LockIcon /> Login to view
      </LocalizedClientLink>
    )

  return (
    <div
      className="relative h-full bg-white border border-[#f3f4f6] rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-shadow duration-300 flex flex-col group"
      data-testid="product-wrapper"
    >
      <LocalizedClientLink
        href={href}
        className="relative block aspect-[3/2] mx-3 mt-5 overflow-hidden bg-white"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-gray-300 bg-[#f7faf9]">
            <ProductPlaceholder size={40} />
          </span>
        )}
      </LocalizedClientLink>

      {badge && (
        <span className="absolute top-4 left-2.5 px-2 py-0.5 rounded text-[10px] leading-4 font-bold text-white bg-[#166534] shadow-sm">
          {badge}
        </span>
      )}
      {stock && (
        <span
          className={`absolute top-4 right-2.5 px-2 py-0.5 rounded border text-[10px] leading-[14px] font-semibold ${STOCK_STYLES[stock]}`}
          data-testid="product-availability"
        >
          {stock}
        </span>
      )}

      <div className="px-4 pt-7 pb-4 flex flex-col flex-1">
        <LocalizedClientLink href={href}>
          <h3
            className="font-bold text-[#0f172a] text-[15px] leading-5 hover:text-[#166534] transition-colors line-clamp-2"
            data-testid="product-title"
          >
            {product.title}
          </h3>
        </LocalizedClientLink>
        {brand?.title && (
          <LocalizedClientLink
            href={`/collections/${brand.handle}`}
            className="self-start mt-1 text-[11px] leading-4 text-[#6b7280] hover:text-[#166534] truncate max-w-full"
          >
            {brand.title}
          </LocalizedClientLink>
        )}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-4">
          <Spec label="MOQ">{moq ? `${moq} ${UNIT}` : "—"}</Spec>
          {hsn && <Spec label="HSN Code">{hsn}</Spec>}
          <div className={`min-w-0 ${hsn ? "col-span-2" : ""}`}>
            <dt className="text-[11px] leading-4 text-[#9ca3af]">Price</dt>
            <dd className="text-xs leading-5 font-semibold text-[#374151]">{price}</dd>
          </div>
        </dl>

        <div className="mt-auto pt-4">
          <div className="flex items-center flex-wrap gap-y-1 text-xs leading-5 [&_[data-testid=compare-toggle]]:text-xs [&_[data-testid=compare-toggle]]:text-[#6b7280]">
            <CompareToggle productId={product.id} />
            <span className="mx-2.5 h-4 w-px bg-[#e5e7eb]" aria-hidden="true" />
            <LocalizedClientLink
              href="/bulk-enquiry"
              className="font-medium text-[#166534] hover:underline"
            >
              Bulk Order
            </LocalizedClientLink>
            <span className="mx-2.5 h-4 w-px bg-[#e5e7eb]" aria-hidden="true" />
            <LocalizedClientLink
              href={`${href}#inquiry`}
              className="font-medium text-[#0757a8] hover:underline"
            >
              Pre Order
            </LocalizedClientLink>
          </div>
          <LocalizedClientLink
            href={href}
            aria-label={`Details for ${product.title}`}
            className="mt-3 flex items-center justify-center h-[34px] rounded-lg border border-[#166534]/40 text-xs font-semibold text-[#166534] hover:bg-[#166534] hover:text-white hover:border-[#166534] transition-colors"
          >
            Details
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default HomeProductCard
