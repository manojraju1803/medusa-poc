import { staticPageMetadata } from "@lib/util/seo"

import SearchTemplate from "@modules/search/templates"

export const generateMetadata = staticPageMetadata({
  path: "/search",
  title: "Search",
  description: "Search ingredients and brands on Ingredients Bazar.",
  noindex: true,
})

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
