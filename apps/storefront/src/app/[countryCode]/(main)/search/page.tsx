import { Metadata } from "next"

import SearchTemplate from "@modules/search/templates"

export const metadata: Metadata = {
  title: "Search | IngredientsBazar",
  description: "Search ingredients and brands on Ingredients Bazar.",
}

export default async function SearchPage(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { countryCode } = await props.params
  const { q, page } = await props.searchParams

  return (
    <SearchTemplate
      q={q || ""}
      page={Math.max(parseInt(page || "1") || 1, 1)}
      countryCode={countryCode}
    />
  )
}
