import { Metadata } from "next"

import { parseOptionValueIds } from "@lib/util/product-option-filters"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

import { getBaseURL } from "@lib/util/env"

export const metadata: Metadata = {
  title: "Multi-Brand Natural Ingredients Catalog | IngredientsBazar",
  description:
    "Explore 370+ lab-certified raw ingredients across food, botanical, dairy, and nutraceutical manufacturing. Verified batch CoA, tiered wholesale pricing, and live inventory.",
  alternates: {
    canonical: `${getBaseURL()}/in/store`,
  },
  openGraph: {
    title: "Multi-Brand Natural Ingredients Catalog | IngredientsBazar",
    description:
      "Direct B2B procurement for 100% pure botanical extracts, plant proteins, natural sweeteners, and clean-label dairy.",
    url: `${getBaseURL()}/in/store`,
    siteName: "IngredientsBazar",
    type: "website",
  },
}

type StorePageSearchParams = Record<string, string | string[] | undefined> & {
  sortBy?: SortOptions
  page?: string
  optionValueIds?: string | string[]
  q?: string
}

type Params = {
  searchParams: Promise<StorePageSearchParams>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page, q } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      optionValueIds={optionValueIds}
      q={typeof q === "string" ? q : undefined}
    />
  )
}

