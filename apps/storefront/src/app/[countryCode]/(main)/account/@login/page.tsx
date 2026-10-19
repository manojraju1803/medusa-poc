import { Metadata } from "next"
import { Suspense } from "react"

import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import LoginTemplate from "@modules/account/templates/login-template"
import { getMenuCategories } from "@modules/layout/lib/menu-categories"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your IngredientsBazar account.",
}

// Round down to an honest "90+" style figure.
const roundStat = (n: number) =>
  n >= 10 ? `${(Math.floor(n / 10) * 10).toLocaleString("en-IN")}+` : String(n)

export default async function Login(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode).catch(() => null)

  const [catalogue, collections, categories] = await Promise.all([
    region
      ? listProducts({
          regionId: region.id,
          queryParams: { limit: 500, fields: "id,collection_id" },
        })
          .then(({ response }) => response)
          .catch(() => null)
      : Promise.resolve(null),
    listCollections({ fields: "id" })
      .then(({ collections }) => collections)
      .catch(() => []),
    getMenuCategories(),
  ])

  // Only brands that actually have products in this catalogue.
  const brandIds = new Set(
    (catalogue?.products ?? [])
      .map((p) => (p as { collection_id?: string | null }).collection_id)
      .filter(Boolean)
  )
  const brandCount = collections.filter((c) => brandIds.has(c.id)).length

  const stats = [
    { value: catalogue?.count ?? 0, label: "Products" },
    { value: brandCount, label: "Brands" },
    { value: categories.length, label: "Categories" },
  ]
    .filter((s) => s.value > 0)
    .map((s) => ({ value: roundStat(s.value), label: s.label }))

  return (
    <Suspense fallback={null}>
      <LoginTemplate
        stats={stats}
        categories={categories.map((c) => ({ name: c.name, handle: c.handle }))}
      />
    </Suspense>
  )
}
