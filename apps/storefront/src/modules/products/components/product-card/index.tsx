import { getProductPrice } from "@lib/util/get-product-price"
import { minQuantityOf } from "@lib/util/min-quantity"
import { isRealProductImageUrl } from "@lib/util/product-image"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPlaceholder from "@modules/common/icons/product-placeholder"
import CompareToggle from "@modules/products/components/compare-toggle"
import WishlistButton from "@modules/products/components/wishlist-button"
import { UNIT, Viewer, hsnOf } from "@modules/products/lib/access"
import Image from "next/image"
import { WarehouseAvailability } from "types/warehouse"

type Props = {
  product: HttpTypes.StoreProduct
  viewer: Viewer
  wishlisted?: boolean
  viewMode?: "grid" | "list"
  // Stock at the buyer's warehouse; approved viewers only.
  availability?: WarehouseAvailability
}

const CardImage = ({
  product,
  className,
}: {
  product: HttpTypes.StoreProduct
  className: string
}) => {
  const src = [product.thumbnail, ...(product.images?.map((i) => i.url) ?? [])].find(
    isRealProductImageUrl
  )
  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className={`relative block bg-white overflow-hidden ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={product.title ?? "Product image"}
          fill
          sizes="(max-width: 640px) 50vw, 300px"
          className="object-contain p-3"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-gray-300 bg-[#f7faf9]">
          <ProductPlaceholder size={40} />
        </span>
      )}
    </LocalizedClientLink>
  )
}

export const CardPrice = ({
  product,
  viewer,
}: {
  product: HttpTypes.StoreProduct
  viewer: Viewer
}) => {
  if (viewer === "approved") {
    const { cheapestPrice } = getProductPrice({ product })
    if (!cheapestPrice) return null
    return (
      <span className="text-sm font-extrabold text-[#006B4F]" data-testid="price">
        {(product.variants?.length ?? 0) > 1 && "From "}
        {cheapestPrice.calculated_price}
        <span className="text-[10px] font-medium text-[#64748b]"> / {UNIT}</span>
      </span>
    )
  }
  if (viewer === "pending") {
    return <span className="text-[11px] text-amber-700 font-medium">Awaiting approval</span>
  }
  return (
    <LocalizedClientLink
      href="/account"
      className="text-[11px] font-semibold text-[#0757a8] hover:underline"
    >
      Login to view price
    </LocalizedClientLink>
  )
}

export default function ProductCard({
  product,
  viewer,
  wishlisted = false,
  viewMode = "grid",
  availability,
}: Props) {
  const moq = minQuantityOf(product.variants?.[0])
  const hsn = hsnOf(product)
  const specs = [
    ["MOQ", `${moq} ${UNIT}`],
    ...(hsn ? [["HSN", hsn]] : []),
  ]
  const brand = product.collection

  const heart = (
    <WishlistButton
      productId={product.id}
      initialSaved={wishlisted}
      isLoggedIn={viewer !== "guest"}
    />
  )

  const brandLine = brand ? (
    <LocalizedClientLink
      href={`/collections/${brand.handle}`}
      className="text-[11px] text-[#0757a8] hover:text-[#006B4F] truncate"
    >
      {brand.title}
    </LocalizedClientLink>
  ) : null

  const stockNote =
    availability && !availability.in_stock ? (
      <span
        className="text-[11px] font-medium text-amber-700"
        data-testid="product-availability"
      >
        {availability.stocked_here
          ? "Out of stock at your warehouse"
          : "Not stocked at your warehouse"}
      </span>
    ) : null

  const title = (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="font-bold text-[#0f172a] text-[13px] leading-snug hover:text-[#006B4F] line-clamp-2"
      data-testid="product-title"
    >
      {product.title}
    </LocalizedClientLink>
  )

  if (viewMode === "list") {
    return (
      <div
        className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 hover:border-[#006B4F]/25 hover:shadow-md transition-all"
        data-testid="product-wrapper"
      >
        <CardImage product={product} className="w-28 h-28 rounded-lg shrink-0 border border-gray-100" />
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex flex-col">
              {title}
              {brandLine}
            </div>
            {heart}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {specs.map(([l, v]) => (
              <div key={l} className="text-[11px]">
                <span className="text-[#9ca3af]">{l}: </span>
                <span className="font-semibold text-[#374151]">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-col">
              <CardPrice product={product} viewer={viewer} />
              {stockNote}
            </div>
            <div className="flex items-center gap-3">
              <CompareToggle productId={product.id} />
              <LocalizedClientLink
                href={`/products/${product.handle}#inquiry`}
                className="px-3 py-1.5 text-[11px] font-bold bg-[#006B4F] hover:bg-[#005a42] text-white rounded-lg"
              >
                Request Quote
              </LocalizedClientLink>
              <LocalizedClientLink
                href={`/products/${product.handle}`}
                className="px-3 py-1.5 text-[11px] font-semibold border border-[#006B4F]/40 text-[#006B4F] hover:bg-[#f0fdf4] rounded-lg"
              >
                View Details
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-full bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-[#006B4F]/30 hover:shadow-[0_4px_20px_rgba(0,107,79,0.08)] transition-all flex flex-col"
      data-testid="product-wrapper"
    >
      <div className="relative">
        <CardImage product={product} className="aspect-square w-full" />
        <div className="absolute top-2 right-2">{heart}</div>
      </div>
      <div className="p-3.5 flex flex-col flex-1 gap-1">
        {title}
        {brand ? (
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-5 h-5 bg-[#006B4F]/10 rounded flex items-center justify-center shrink-0">
              <span className="text-[8px] font-bold text-[#006B4F]">
                {brand.title.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex">{brandLine}</div>
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 my-2 bg-[#fafffe] border border-[#f0fdf4] rounded-lg p-2.5">
          {specs.map(([l, v]) => (
            <div key={l}>
              <span className="text-[9px] text-[#9ca3af] block uppercase tracking-wide">{l}</span>
              <span className="text-[11px] font-semibold text-[#374151]">{v}</span>
            </div>
          ))}
        </div>
        <div className="mb-2 flex flex-col">
          <CardPrice product={product} viewer={viewer} />
          {stockNote}
        </div>
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-50">
          <CompareToggle productId={product.id} />
          <span className="text-gray-100">|</span>
          <LocalizedClientLink
            href={`/products/${product.handle}#inquiry`}
            className="text-[10px] text-[#006B4F] hover:text-[#005a42] font-medium"
          >
            Request Sample
          </LocalizedClientLink>
        </div>
        <div className="flex gap-1.5 mt-auto">
          <LocalizedClientLink
            href={`/products/${product.handle}#inquiry`}
            className="flex-1 py-2 text-center text-[11px] font-bold bg-[#006B4F] hover:bg-[#005a42] text-white rounded-lg"
          >
            Request Quote
          </LocalizedClientLink>
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="px-3 py-2 text-[11px] font-semibold border border-gray-200 text-[#374151] hover:border-[#006B4F]/40 hover:text-[#006B4F] rounded-lg"
          >
            View
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
