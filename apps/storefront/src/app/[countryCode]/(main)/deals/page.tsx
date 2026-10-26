import { staticPageMetadata } from "@lib/util/seo"

import DealsTemplate from "@modules/deals/templates"

export const generateMetadata = staticPageMetadata({
  path: "/deals",
  title: "Deal of the Month",
  description: "Bulk discounts on selected ingredients.",
})

type Params = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ category?: string; sort?: string }>
}

export default async function DealsPage(props: Params) {
  const { countryCode } = await props.params
  const { category, sort } = await props.searchParams
  return (
    <DealsTemplate
      countryCode={countryCode}
      category={category}
      sort={sort === "discount" ? "discount" : "featured"}
    />
  )
}
