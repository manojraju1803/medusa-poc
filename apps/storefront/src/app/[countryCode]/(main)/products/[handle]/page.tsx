import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions
        ?.map((r: HttpTypes.StoreRegion) =>
          r.countries?.map((c: HttpTypes.StoreRegionCountry) => c.iso_2)
        )
        .flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
): HttpTypes.StoreProductImage[] | null {
  let images: HttpTypes.StoreProductImage[] | null = product.images ?? null

  if (selectedVariantId && product.variants) {
    const variant = product.variants.find((v) => v.id === selectedVariantId)
    if (variant && variant.images?.length) {
      const imageIdsMap = new Map(variant.images.map((i) => [i.id, true]))
      images = product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
    }
  }

  if ((!images || images.length === 0) && product.thumbnail) {
    return [{ id: "thumbnail", url: product.thumbnail }] as HttpTypes.StoreProductImage[]
  }

  return images
}

import { getBaseURL } from "@lib/util/env"
import { getProductPrice } from "@lib/util/get-product-price"
import { isProductInStock } from "@lib/util/product"

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle, countryCode } = params
  const baseUrl = getBaseURL()

  try {
    const region = await getRegion(countryCode)

    if (!region) {
      return { title: "Product Not Found | IngredientsBazar" }
    }

    const { response } = await listProducts({
      countryCode,
      queryParams: { handle },
    })

    const product = response?.products?.[0]

    if (!product) {
      return { title: "Product Not Found | IngredientsBazar" }
    }

    const rawTitle = product.title || "Product"
    const cleanTitle = `${rawTitle} — Industrial Wholesale B2B Sourcing | IngredientsBazar`
    const rawDesc = product.description || product.title || ""
    const cleanDesc = rawDesc
      ? String(rawDesc).replace(/<[^>]*>?/gm, "").slice(0, 160)
      : `Buy ${rawTitle} with verified Certificate of Analysis (CoA), transparent tiered wholesale pricing, and pan-India freight delivery on IngredientsBazar.`

    const canonicalUrl = `${baseUrl}/${countryCode}/products/${handle}`

    return {
      title: cleanTitle,
      description: cleanDesc,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: cleanTitle,
        description: cleanDesc,
        url: canonicalUrl,
        siteName: "IngredientsBazar",
        type: "website",
        images: product.thumbnail
          ? [
              {
                url: product.thumbnail,
                width: 800,
                height: 800,
                alt: rawTitle,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: cleanTitle,
        description: cleanDesc,
        images: product.thumbnail ? [product.thumbnail] : [],
      },
    }
  } catch {
    return { title: "Product | IngredientsBazar" }
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const baseUrl = getBaseURL()

  const region = await getRegion(params.countryCode)
  const selectedVariantId = searchParams?.v_id

  if (!region) {
    notFound()
  }

  let pricedProduct: HttpTypes.StoreProduct | undefined
  try {
    const { response } = await listProducts({
      countryCode: params.countryCode,
      queryParams: { handle: params.handle },
    })
    pricedProduct = response?.products?.[0]
  } catch (err) {
    console.error("ProductPage fetch error:", err)
  }

  if (!pricedProduct) {
    notFound()
  }

  const images = getImagesForVariant(pricedProduct, selectedVariantId)
  const inStock = isProductInStock(pricedProduct)
  const { cheapestPrice } = getProductPrice({ product: pricedProduct })

  const safeTitle = pricedProduct.title || "Product"
  const rawProductDesc = pricedProduct.description || pricedProduct.title || ""
  const safeDescription = rawProductDesc
    ? String(rawProductDesc).replace(/<[^>]*>?/gm, "").slice(0, 300)
    : "Verified natural raw ingredient with Certificate of Analysis."

  // Schema.org Product & Breadcrumb JSON-LD
  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: safeTitle,
    image: pricedProduct.thumbnail ? [pricedProduct.thumbnail] : [],
    description: safeDescription,
    sku: pricedProduct.id,
    mpn: pricedProduct.hs_code || pricedProduct.id,
    brand: {
      "@type": "Brand",
      name: (pricedProduct.metadata?.brand as string) || (pricedProduct.subtitle as string) || "IngredientsBazar Verified",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/${params.countryCode}/products/${params.handle}`,
      priceCurrency: region.currency_code?.toUpperCase() || "INR",
      price: cheapestPrice?.calculated_price ? (cheapestPrice.calculated_price_number || 0) : "0",
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "IngredientsBazar",
      },
    },
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/${params.countryCode}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Store",
        item: `${baseUrl}/${params.countryCode}/store`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: safeTitle,
        item: `${baseUrl}/${params.countryCode}/products/${params.handle}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        images={images ?? []}
      />
    </>
  )
}

