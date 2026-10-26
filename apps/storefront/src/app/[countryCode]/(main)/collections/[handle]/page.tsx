import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { pageMetadata, toMetaDescription } from "@lib/util/seo"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { getCollectionWithMetadata } from "@modules/suppliers/data"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { parseOptionValueIds } from "@lib/util/product-option-filters"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      page?: string
      sortBy?: SortOptions
      optionValueIds?: string | string[]
    }
  >
}

export const PRODUCT_LIMIT = 12

// The page reads the buyer's cookies, so it can never render statically. With no
// collections, generateStaticParams returns [] and Next would otherwise try to.
export const dynamic = "force-dynamic"

export async function generateStaticParams() {
  const { collections } = await listCollections({
    fields: "handle",
  })

  if (!collections) {
    return []
  }

  const countryCodes = await listRegions().then(
    (regions: StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  const collectionHandles = collections.map(
    (collection: StoreCollection) => collection.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string) =>
      collectionHandles.map((handle: string | undefined) => ({
        countryCode,
        handle,
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { countryCode, handle } = await props.params
  // The same request as the page below, so it is only made once.
  const collection = await getCollectionWithMetadata(handle)

  if (!collection) {
    notFound()
  }

  const description =
    typeof collection.metadata?.description === "string" &&
    collection.metadata.description.trim()
      ? toMetaDescription(collection.metadata.description)
      : `Buy ${collection.title} ingredients in bulk from a verified supplier on Ingredients Bazar.`

  return pageMetadata({
    countryCode,
    path: `/collections/${handle}`,
    title: `${collection.title} Ingredients`,
    description,
  })
}

export default async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  // With metadata (country / description / logo) for the supplier header.
  const collection = await getCollectionWithMetadata(params.handle)

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy}
      countryCode={params.countryCode}
      optionValueIds={optionValueIds}
    />
  )
}
