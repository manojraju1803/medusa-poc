import { staticPageMetadata } from "@lib/util/seo"

import { parseOptionValueIds } from "@lib/util/product-option-filters"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const generateMetadata = staticPageMetadata({
  path: "/store",
  title: "Buy Bulk Food Ingredients",
  description:
    "Browse verified bulk food ingredients by category and brand. Approved business buyers see bulk prices, quantity slabs and live stock.",
})

type StorePageSearchParams = Record<string, string | string[] | undefined> & {
  sortBy?: SortOptions
  page?: string
  optionValueIds?: string | string[]
  category?: string | string[]
  brand?: string | string[]
  view?: string
}

type Params = {
  searchParams: Promise<StorePageSearchParams>
  params: Promise<{
    countryCode: string
  }>
}

const asList = (v?: string | string[]) =>
  (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean)

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      optionValueIds={optionValueIds}
      categoryHandles={asList(searchParams.category)}
      brandHandles={asList(searchParams.brand)}
      viewMode={searchParams.view === "list" ? "list" : "grid"}
    />
  )
}
