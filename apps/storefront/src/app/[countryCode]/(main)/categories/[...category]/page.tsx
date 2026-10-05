import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { parseOptionValueIds } from "@lib/util/product-option-filters"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      sortBy?: SortOptions
      page?: string
      optionValueIds?: string | string[]
    }
  >
}

export async function generateStaticParams() {
  try {
    const product_categories = await listCategories()

    if (!product_categories) {
      return []
    }

    const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    const categoryHandles = product_categories.map(
      (category: HttpTypes.StoreProductCategory) => category.handle
    )

    const staticParams = countryCodes
      ?.map((countryCode: string | undefined) =>
        categoryHandles.map((handle: string) => ({
          countryCode,
          category: [handle],
        }))
      )
      .flat()

    return staticParams || []
  } catch (error) {
    console.error("Failed to generate static params for categories:", error)
    return []
  }
}

import { getBaseURL } from "@lib/util/env"

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const baseUrl = getBaseURL()

  try {
    const productCategory = await getCategoryByHandle(params.category)

    if (!productCategory) {
      return { title: "Category | IngredientsBazar" }
    }

    const title = `${productCategory.name} — Buy Bulk Raw Ingredients | IngredientsBazar`
    const description =
      productCategory.description ||
      `Source wholesale ${productCategory.name} directly from verified manufacturers. 100% lab-tested batch CoA and pan-India logistics on IngredientsBazar.`

    const canonicalUrl = `${baseUrl}/${params.countryCode}/categories/${params.category.join("/")}`

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "IngredientsBazar",
        type: "website",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    }
  } catch {
    return { title: "Category | IngredientsBazar" }
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const baseUrl = getBaseURL()
  const { sortBy, page } = searchParams || {}
  const optionValueIds = parseOptionValueIds(searchParams || {})

  let productCategory: HttpTypes.StoreProductCategory | undefined
  try {
    productCategory = await getCategoryByHandle(params.category)
  } catch (err) {
    console.error("CategoryPage getCategoryByHandle error:", err)
  }

  if (!productCategory) {
    notFound()
  }

  // Schema.org CollectionPage & BreadcrumbList JSON-LD
  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: productCategory.name,
    description: productCategory.description || `Browse ${productCategory.name} raw materials on IngredientsBazar`,
    url: `${baseUrl}/${params.countryCode}/categories/${params.category.join("/")}`,
    isPartOf: {
      "@type": "WebSite",
      name: "IngredientsBazar",
      url: baseUrl,
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
        name: "Product Catalog",
        item: `${baseUrl}/${params.countryCode}/store`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: productCategory.name,
        item: `${baseUrl}/${params.countryCode}/categories/${params.category.join("/")}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryTemplate
        category={productCategory}
        sortBy={sortBy}
        page={page}
        countryCode={params.countryCode}
        optionValueIds={optionValueIds}
      />
    </>
  )
}

