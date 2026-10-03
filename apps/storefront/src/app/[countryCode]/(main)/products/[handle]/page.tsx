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
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
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
  const params = await props.params
  const { handle, countryCode } = params
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

    return {
      title: `${product.title} | IngredientsBazar`,
      description: `${product.description ?? product.title}`,
      openGraph: {
        title: `${product.title} | IngredientsBazar`,
        description: `${product.description ?? product.title}`,
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

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
      images={images ?? []}
    />
  )
}

