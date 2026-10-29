import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import { isRealProductImageUrl } from "@lib/util/product-image"
import { pageMetadata, toMetaDescription } from "@lib/util/seo"
import { productDescriptionText } from "@modules/products/lib/json-ld"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

// The listing defaults plus the product's categories, which the page needs for
// breadcrumbs, the compare peers and similar products. One request instead of
// a second one for the categories after this one returns. Every field keeps
// its "+"/"*" prefix: an unprefixed one makes Medusa drop its default fields.
const PRODUCT_PAGE_FIELDS =
  "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+variants.metadata,+metadata,+tags,+categories.id,+categories.name,+categories.handle,+categories.parent_category_id"

// generateMetadata and the page make this same request, so Next fetches it once.
const getProduct = (countryCode: string, handle: string) =>
  listProducts({
    countryCode,
    queryParams: { handle, fields: PRODUCT_PAGE_FIELDS },
  }).then(({ response }) => response.products[0])

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        withAuth: false,
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
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images!.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { countryCode, handle } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const product = await getProduct(countryCode, handle)

  if (!product) {
    notFound()
  }

  const title = product.title ?? "Ingredient"
  const brand = product.collection?.title
  const description =
    productDescriptionText(product) ||
    toMetaDescription(product.subtitle) ||
    `Buy ${title}${
      brand ? ` by ${brand}` : ""
    } in bulk from verified suppliers on Ingredients Bazar. Request a quote or sample.`

  const images = Array.from(
    new Set(
      [product.thumbnail, ...(product.images?.map((i) => i.url) ?? [])].filter(
        isRealProductImageUrl
      )
    )
  )
    .slice(0, 4)
    .map((url) => ({ url, alt: title }))

  // Prices are left out on purpose: they depend on who is looking.
  return pageMetadata({
    countryCode,
    path: `/products/${handle}`,
    title,
    description,
    images,
  })
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await getProduct(params.countryCode, params.handle)

  if (!pricedProduct) {
    notFound()
  }

  const images = getImagesForVariant(pricedProduct, selectedVariantId)

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
      images={images ?? []}
    />
  )
}
