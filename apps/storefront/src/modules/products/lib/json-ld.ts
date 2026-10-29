import { isRealProductImageUrl } from "@lib/util/product-image"
import {
  SITE_NAME,
  absoluteUrl,
  localizedPath,
  toMetaDescription,
} from "@lib/util/seo"
import { HttpTypes } from "@medusajs/types"

// Plain-text product description for meta tags and structured data. Most
// descriptions imported from the old WordPress site open with empty
// "Not Available Yet" placeholder paragraphs, which are dropped here.
export const productDescriptionText = (
  product: HttpTypes.StoreProduct,
  max?: number
) =>
  toMetaDescription(
    product.description?.replace(/Not Available Yet/gi, " "),
    max
  )

type ProductJsonLdInput = {
  // Already passed through `forViewer`, so it carries no stock for guests.
  product: HttpTypes.StoreProduct
  countryCode: string
  brand?: string | null
  category?: string | null
  // Only pass a price the viewer can already see on the page (approved
  // buyers). Without one the Offer is left out entirely, so a guest's page
  // source never carries a price.
  price?: HttpTypes.StoreCalculatedPrice
  // Undefined when stock isn't shown to this viewer.
  stock?: number
}

// schema.org Product for the product page.
export const productJsonLd = ({
  product,
  countryCode,
  brand,
  category,
  price,
  stock,
}: ProductJsonLdInput) => {
  const url = absoluteUrl(
    localizedPath(countryCode, `/products/${product.handle}`)
  )
  const images = Array.from(
    new Set(
      [product.thumbnail, ...(product.images?.map((i) => i.url) ?? [])].filter(
        isRealProductImageUrl
      )
    )
  ).map((src) => absoluteUrl(src))
  const description = productDescriptionText(product, 5000)
  const sku = product.variants?.[0]?.sku

  const amount = price?.calculated_amount
  const offer =
    typeof amount === "number" && price?.currency_code
      ? {
          "@type": "Offer",
          url,
          price: amount,
          priceCurrency: price.currency_code.toUpperCase(),
          ...(stock !== undefined
            ? {
                availability:
                  stock > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
              }
            : {}),
          seller: { "@type": "Organization", name: SITE_NAME },
        }
      : undefined

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    url,
    ...(description ? { description } : {}),
    ...(images.length ? { image: images } : {}),
    ...(sku ? { sku } : {}),
    ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
    ...(category ? { category } : {}),
    ...(offer ? { offers: offer } : {}),
  }
}
