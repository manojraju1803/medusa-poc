import { getProductPrice } from "@lib/util/get-product-price"
import { getProductTotalInventory, isProductInStock } from "@lib/util/product"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

// Known verified manufacturers / brands in IngredientsBazar catalog
const KNOWN_BRANDS = [
  "Meggle",
  "Fonterra",
  "Glanbia",
  "Arla",
  "Lactalis",
  "Ingredia",
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
  "Bakkal",
  "Cremo",
  "Parag",
  "HMS",
  "Amishi",
  "Barentz",
  "Kemin",
]

// Helper to extract brand name from product title
const getBrandFromTitle = (title: string = "") => {
  const words = title.split(/\s+/)
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z]/g, "")
    const matched = KNOWN_BRANDS.find(
      (b) => b.toLowerCase() === cleanWord.toLowerCase()
    )
    if (matched) return matched
  }
  return null
}

type BadgeStyle = {
  text: string
  bg: string
  textColor: string
  borderColor: string
  icon?: string
}

const getProductBadges = (
  product: HttpTypes.StoreProduct,
  inStock: boolean,
  totalStock: number
): {
  primaryBadge: BadgeStyle
  stockBadge: BadgeStyle
} => {
  const title = product.title || ""
  const lowerTitle = title.toLowerCase()
  const metadata = (product.metadata || {}) as Record<string, any>
  const tags = (product.tags || []).map((t: any) =>
    (t.value || t.name || "").toString().toLowerCase()
  )

  const brand =
    (product.metadata?.brand as string) ||
    (product.subtitle as string) ||
    getBrandFromTitle(product.title)

  // 1. Primary Badge (Per product: Supplier, Certification, Grade, or Category)
  let primaryBadge: BadgeStyle = {
    text: "Verified Supplier",
    bg: "bg-[#dcfce7]",
    textColor: "text-[#166534]",
    borderColor: "border-[#bbf7d0]",
    icon: "✓",
  }

  if (metadata.badge) {
    primaryBadge = {
      text: String(metadata.badge),
      bg: "bg-[#f0fdf4]",
      textColor: "text-[#166534]",
      borderColor: "border-[#bbf7d0]",
      icon: "★",
    }
  } else if (brand) {
    primaryBadge = {
      text: `${brand} Verified`,
      bg: "bg-[#dcfce7]",
      textColor: "text-[#166534]",
      borderColor: "border-[#bbf7d0]",
      icon: "✓",
    }
  } else if (
    metadata.grade ||
    lowerTitle.includes("pharma") ||
    lowerTitle.includes(" usp") ||
    lowerTitle.includes(" ip ") ||
    lowerTitle.includes(" bp ") ||
    lowerTitle.includes(" ep ")
  ) {
    primaryBadge = {
      text: metadata.grade || "Pharma Grade",
      bg: "bg-[#eff6ff]",
      textColor: "text-[#1e40af]",
      borderColor: "border-[#bfdbfe]",
      icon: "💊",
    }
  } else if (
    tags.includes("organic") ||
    lowerTitle.includes("organic") ||
    lowerTitle.includes("bio ")
  ) {
    primaryBadge = {
      text: "Organic Certified",
      bg: "bg-[#dcfce7]",
      textColor: "text-[#166534]",
      borderColor: "border-[#bbf7d0]",
      icon: "🌱",
    }
  } else if (
    lowerTitle.includes("spray dried") ||
    lowerTitle.includes("sd ") ||
    lowerTitle.startsWith("sd-")
  ) {
    primaryBadge = {
      text: "Spray Dried",
      bg: "bg-[#fff7ed]",
      textColor: "text-[#9a3412]",
      borderColor: "border-[#ffedd5]",
      icon: "🧪",
    }
  } else if (
    lowerTitle.includes("extract") ||
    lowerTitle.includes("oleoresin") ||
    lowerTitle.includes("botanical")
  ) {
    primaryBadge = {
      text: "Botanical Extract",
      bg: "bg-[#f0fdf4]",
      textColor: "text-[#166534]",
      borderColor: "border-[#bbf7d0]",
      icon: "🌿",
    }
  } else if (
    lowerTitle.includes("whey") ||
    lowerTitle.includes("dairy") ||
    lowerTitle.includes("cream") ||
    lowerTitle.includes("casein") ||
    lowerTitle.includes("lactose") ||
    lowerTitle.includes("milk") ||
    lowerTitle.includes("smp")
  ) {
    primaryBadge = {
      text: "Dairy Grade",
      bg: "bg-[#f0f9ff]",
      textColor: "text-[#0369a1]",
      borderColor: "border-[#bae6fd]",
      icon: "🥛",
    }
  } else if (
    lowerTitle.includes("flavour") ||
    lowerTitle.includes("flavor") ||
    lowerTitle.includes("cocoa") ||
    lowerTitle.includes("chocolate")
  ) {
    primaryBadge = {
      text: "Food Flavour",
      bg: "bg-[#faf5ff]",
      textColor: "text-[#7e22ce]",
      borderColor: "border-[#f3e8ff]",
      icon: "🍫",
    }
  } else if (
    lowerTitle.includes("protein") ||
    lowerTitle.includes("amino") ||
    lowerTitle.includes("isolate") ||
    lowerTitle.includes("wpc")
  ) {
    primaryBadge = {
      text: "High Protein",
      bg: "bg-[#ecfeff]",
      textColor: "text-[#0e7490]",
      borderColor: "border-[#cffafe]",
      icon: "🧬",
    }
  } else if (
    lowerTitle.includes("sweet") ||
    lowerTitle.includes("stevia") ||
    lowerTitle.includes("sucralose") ||
    lowerTitle.includes("polyol")
  ) {
    primaryBadge = {
      text: "Sweetener",
      bg: "bg-[#fefce8]",
      textColor: "text-[#854d0e]",
      borderColor: "border-[#fef08a]",
      icon: "🍯",
    }
  } else if (
    lowerTitle.includes("premitex") ||
    lowerTitle.includes("premigum") ||
    lowerTitle.includes("emulsifier") ||
    lowerTitle.includes("stabilizer") ||
    lowerTitle.includes("gum")
  ) {
    primaryBadge = {
      text: "Food Stabilizer",
      bg: "bg-[#f0fdfa]",
      textColor: "text-[#0f766e]",
      borderColor: "border-[#ccfbf1]",
      icon: "🧪",
    }
  } else if (lowerTitle.includes("coffee") || lowerTitle.includes("tea")) {
    primaryBadge = {
      text: "Pure Beverage",
      bg: "bg-[#fffbeb]",
      textColor: "text-[#b45309]",
      borderColor: "border-[#fde68a]",
      icon: "☕",
    }
  }

  // 2. Stock / Inventory / Dispatch Status Badge (Right Badge)
  let stockBadge: BadgeStyle = {
    text: "In Stock",
    bg: "bg-[#f0fdf4]",
    textColor: "text-[#166534]",
    borderColor: "border-[#bbf7d0]",
    icon: "●",
  }

  if (!inStock) {
    stockBadge = {
      text: "Out of Stock",
      bg: "bg-[#fef2f2]",
      textColor: "text-[#991b1b]",
      borderColor: "border-[#fecaca]",
      icon: "●",
    }
  } else if (totalStock > 0) {
    stockBadge = {
      text: `In Stock (${totalStock > 999 ? (totalStock / 1000).toFixed(0) + "k" : totalStock} kg)`,
      bg: "bg-[#f0fdf4]",
      textColor: "text-[#166534]",
      borderColor: "border-[#bbf7d0]",
      icon: "●",
    }
  } else if (metadata.lead_time) {
    stockBadge = {
      text: `Lead: ${metadata.lead_time}`,
      bg: "bg-[#f8fafc]",
      textColor: "text-[#334155]",
      borderColor: "border-[#e2e8f0]",
      icon: "⏱",
    }
  }

  return { primaryBadge, stockBadge }
}

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  // Extract MOQ from first variant if present
  const firstVariant = product.variants?.[0] as any
  const moq =
    Number(firstVariant?.metadata?.min_quantity) ||
    Number(firstVariant?.min_quantity) ||
    Number(product.metadata?.min_quantity) ||
    Number(product.metadata?.moq) ||
    1

  // Extract HSN code from title if present
  const hsnMatch = product.title?.match(/\b(\d{6,8})\b/)
  const hsnCode = product.hs_code || (hsnMatch ? hsnMatch[1] : null)

  // Calculate live stock
  const totalStock = getProductTotalInventory(product)

  // Calculate accurate stock status
  const inStock = isProductInStock(product)

  const brand =
    (product.metadata?.brand as string) ||
    (product.subtitle as string) ||
    getBrandFromTitle(product.title)

  const { primaryBadge, stockBadge } = getProductBadges(
    product,
    inStock,
    totalStock
  )

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block h-full"
    >
      <div
        data-testid="product-wrapper"
        className="h-full flex flex-col justify-between bg-white border border-gray-200/90 hover:border-[#1C94D2] rounded-2xl p-4 transition-all duration-300 ease-out shadow-xs hover:shadow-xl group-hover:-translate-y-1.5"
      >
        <div>
          {/* Top Badges Strip - Dynamic per product */}
          <div className="flex items-center justify-between gap-1.5 mb-3 min-h-[24px]">
            {/* Dynamic Primary / Verification Badge */}
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold ${primaryBadge.textColor} ${primaryBadge.bg} px-2 py-0.5 rounded-full border ${primaryBadge.borderColor} shadow-xs whitespace-nowrap`}
            >
              {primaryBadge.icon === "✓" ? (
                <svg
                  className={`w-2.5 h-2.5 ${primaryBadge.textColor} flex-shrink-0`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="text-[11px] leading-none">{primaryBadge.icon}</span>
              )}
              <span>{primaryBadge.text}</span>
            </span>

            {/* Dynamic In Stock Badge with Radar Animation */}
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${stockBadge.textColor} ${stockBadge.bg} border ${stockBadge.borderColor} px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0`}
            >
              {stockBadge.text.includes("In Stock") ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#97C93E] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#97C93E]"></span>
                </span>
              ) : stockBadge.text.includes("Out of Stock") ? (
                <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
              ) : (
                <span className="text-[10px] leading-none">⏱</span>
              )}
              <span>{stockBadge.text}</span>
            </span>
          </div>

          {/* Product Thumbnail in Clean Card */}
          <div className="relative overflow-hidden rounded-xl bg-[#f8fafc] border border-gray-100 mb-3 aspect-square flex items-center justify-center p-3 group-hover:bg-white transition-colors duration-300">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col gap-1">
            {brand && (
              <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider">
                {brand}
              </span>
            )}

            <h3
              className="text-sm font-bold text-[#0f172a] group-hover:text-[#1C94D2] transition-colors line-clamp-2 min-h-[2.5rem] leading-snug"
              data-testid="product-title"
            >
              {product.title}
            </h3>

            {/* MOQ Indicator & Origin / HSN */}
            <div className="flex items-center justify-between text-[11px] font-medium text-[#64748b] pt-1">
              <span className="flex items-center gap-1">
                <span>📦</span>
                <span>
                  MOQ: <strong className="text-[#0f172a]">{moq} units</strong>
                </span>
              </span>
              {hsnCode ? (
                <span className="text-[10px] bg-sky-50 px-1.5 py-0.5 rounded text-[#0369a1] font-mono border border-sky-100">
                  HSN: {hsnCode}
                </span>
              ) : product.origin_country ? (
                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-[#475569]">
                  {product.origin_country}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Pricing & CTA Button */}
        <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] text-[#6b7280] uppercase tracking-wider font-bold">
              B2B Price
            </span>
            <div className="text-sm font-extrabold text-[#0f172a]">
              {cheapestPrice ? (
                <PreviewPrice price={cheapestPrice} />
              ) : (
                <span className="text-xs text-[#1C94D2] font-semibold">
                  Login for Pricing
                </span>
              )}
            </div>
          </div>

          <span className="px-3 py-1.5 rounded-lg bg-[#1C94D2] group-hover:bg-[#0284c7] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1">
            <span>View Specs</span>
            <span className="group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </span>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
