import { getProductTotalInventory, isProductInStock } from "@lib/util/product"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const KNOWN_BRANDS = [
  "Taiyo",
  "Blendhub",
  "Akay",
  "Koncor",
  "Amul",
  "Maybi",
  "Acronym",
  "IB",
  "Roquette",
  "Tata",
  "Kerry",
  "ADM",
  "Cargill",
  "Symrise",
  "Givaudan",
  "FrieslandCampina",
  "Glanbia",
  "IFF",
  "Kalsec",
  "DuPont",
  "Naturex",
  "Synthite",
  "Vidya",
  "Arjuna",
  "Indena",
  "Shanti",
  "Dynamix",
  "Jindal",
  "Morde",
  "Lactalis",
  "Meggle",
  "Arla",
  "Fonterra",
  "Lactoprot",
  "Solae",
  "Almer",
  "Drytech",
  "Paras",
  "KMF",
  "Prabhat",
  "Sonai",
  "Inno",
  "Yongan",
]

// Helper to extract brand name from title or metadata
const getBrandName = (product: HttpTypes.StoreProduct): string => {
  if (product.metadata?.brand && typeof product.metadata.brand === "string") {
    return product.metadata.brand
  }
  if (product.subtitle) {
    return product.subtitle
  }
  const title = product.title || ""
  const words = title.split(/\s+/)
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z]/g, "")
    const matched = KNOWN_BRANDS.find(
      (b) => b.toLowerCase() === cleanWord.toLowerCase()
    )
    if (matched) return matched
  }
  return "Direct Manufacturer"
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const brandName = getBrandName(product)

  // Calculate live stock counts and availability
  const totalStock = getProductTotalInventory(product)
  const inStock = isProductInStock(product)

  const moq =
    Number(product.variants?.[0]?.metadata?.min_quantity) ||
    Number(product.metadata?.min_quantity) ||
    1

  const hsnMatch = product.title?.match(/\b(\d{6,8})\b/)
  const hsnCode =
    (product.metadata?.hsn_code as string) ||
    product.hs_code ||
    (hsnMatch ? hsnMatch[1] : null) ||
    product.handle?.match(/\d{8}/)?.[0]

  return (
    <div id="product-info" className="flex flex-col gap-y-3.5">
      {/* Badges Strip with Dynamic Verification and Stock Counts */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Verified Supplier Badge */}
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#15803D] bg-[#F4FBEA] px-3 py-1 rounded-full border border-[#D4EDAB] shadow-xs">
          <svg
            className="w-3.5 h-3.5 text-[#15803D]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Verified Supplier: {brandName}
        </span>

        {/* Dynamic Stock Count Badge */}
        {inStock ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#15803D] bg-[#F4FBEA] border border-[#D4EDAB] px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#97C93E] animate-pulse" />
            {totalStock > 0
              ? `In Stock (${totalStock.toLocaleString()} Units Available)`
              : "In Stock (Bulk Ready)"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
            Out of Stock
          </span>
        )}

        {/* Minimum Order Quantity (MOQ) Badge */}
        {moq > 1 && (
          <span className="text-[11px] font-medium text-[#0369A1] bg-[#EBF6FC] border border-[#BAE6FD] px-2.5 py-1 rounded-full">
            MOQ: {moq} Units
          </span>
        )}

        {/* HSN Code Badge */}
        {hsnCode && (
          <span className="text-[11px] font-medium text-[#475569] bg-[#f8fafc] border border-gray-200 px-2.5 py-1 rounded-full font-mono">
            HSN: {hsnCode}
          </span>
        )}

        {/* Collection / Category Link */}
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-[11px] font-medium text-[#1C94D2] hover:text-[#0284C7] hover:underline ml-auto"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
      </div>

      {/* Product Title */}
      <h1
        className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight leading-snug"
        data-testid="product-title"
      >
        {product.title}
      </h1>

      {/* Short Subtitle / Origin Header */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        {product.origin_country && (
          <span>
            Origin: <strong>{product.origin_country}</strong>
          </span>
        )}
        {product.material && (
          <>
            <span>•</span>
            <span>
              Grade: <strong>{product.material}</strong>
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
