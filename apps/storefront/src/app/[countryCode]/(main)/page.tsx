import { retrieveCustomer } from "@lib/data/customer"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  staticPageMetadata,
} from "@lib/util/seo"
import { HttpTypes } from "@medusajs/types"
import {
  APPLICATION_HANDLES,
  Applications,
  CategoryCard,
  StatStrip,
} from "@modules/home/components/catalogue-sections"
import CategoryStrip from "@modules/home/components/category-carousel"
import GlobalPartners from "@modules/home/components/global-partners"
import { PriceAccess } from "@modules/home/components/home-product-card"
import Hero from "@modules/home/components/hero"
import InstructionVideos from "@modules/home/components/instruction-videos"
import {
  CtaBanner,
  MarketplaceComparison,
  OrderProcess,
  WhyChooseUs,
} from "@modules/home/components/marketing-sections"
import ProductRow from "@modules/home/components/product-row"
import Testimonials from "@modules/home/components/testimonials"
import { getMenuCategories } from "@modules/layout/lib/menu-categories"

export const generateMetadata = staticPageMetadata({
  path: "",
  title: { absolute: `${SITE_NAME} - ${SITE_TAGLINE}` },
  description: SITE_DESCRIPTION,
})

const CARD_FIELDS =
  "id,title,handle,thumbnail,created_at,+metadata,collection.id,collection.title,collection.handle,variants.id,+variants.metadata,+variants.inventory_quantity,+variants.manage_inventory,*variants.calculated_price"
const ROW_SIZE = 4

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const fetchRow = (order: string) =>
    listProducts({
      regionId: region.id,
      queryParams: { limit: 24, order, fields: CARD_FIELDS },
    })
      .then(({ response }) => response.products)
      .catch(() => [] as HttpTypes.StoreProduct[])

  const [customer, menuCategories, catalogue, byNew, byTitle, byUpdated] =
    await Promise.all([
      retrieveCustomer().catch(() => null),
      getMenuCategories(),
      // Light-weight pass over the whole (channel-scoped) catalogue for
      // category images and counts.
      // No prices asked for, so no auth: one cached response for every
      // visitor instead of a ~1s cold fetch per signed-in buyer. Refreshed
      // hourly, so new products show up in the counts.
      listProducts({
        regionId: region.id,
        withAuth: false,
        revalidate: 3600,
        queryParams: {
          limit: 500,
          fields: "id,thumbnail,categories.id,categories.parent_category_id",
        },
      })
        .then(({ response }) => response)
        .catch(() => ({ products: [] as HttpTypes.StoreProduct[], count: 0 })),
      fetchRow("-created_at"),
      fetchRow("title"),
      fetchRow("-updated_at"),
    ])

  // Distinct products per row, preferring ones with an image.
  const used = new Set<string>()
  const pick = (list: HttpTypes.StoreProduct[]) => {
    const sorted = [...list].sort(
      (a, b) => Number(!!b.thumbnail) - Number(!!a.thumbnail)
    )
    const row = sorted.filter((p) => !used.has(p.id)).slice(0, ROW_SIZE)
    row.forEach((p) => used.add(p.id))
    return row
  }
  const newArrivals = pick(byNew)
  const featured = pick(byTitle)
  const trending = pick(byUpdated)

  // Price access: the backend strips calculated_price for anyone not in the
  // Approved group, so a visible price means the caller is approved.
  const anyPriced = [...newArrivals, ...featured, ...trending].some((p) =>
    p.variants?.some((v) => !!v.calculated_price)
  )
  const access: PriceAccess = !customer
    ? "guest"
    : anyPriced
    ? "approved"
    : "pending"

  // Category cards: product count + first product image per top-level category.
  const stats = new Map<string, { count: number; image: string | null }>()
  for (const p of catalogue.products) {
    const topIds = new Set(
      (p.categories ?? []).map((c) => c.parent_category_id || c.id)
    )
    topIds.forEach((id) => {
      const s = stats.get(id) ?? { count: 0, image: null }
      s.count += 1
      s.image = s.image || p.thumbnail || null
      stats.set(id, s)
    })
  }

  const cards: CategoryCard[] = menuCategories.map((c) => ({
    id: c.id,
    name: c.name,
    handle: c.handle,
    productCount: stats.get(c.id)?.count ?? 0,
    subCount: c.children.length,
    image: stats.get(c.id)?.image,
  }))
  const hasCounts = cards.some((c) => c.productCount > 0)
  const visible = (c: CategoryCard) => !hasCounts || c.productCount > 0

  const appCards = APPLICATION_HANDLES.map((h) =>
    cards.find((c) => c.handle === h)
  ).filter((c): c is CategoryCard => !!c && visible(c))
  const ingredientCards = cards
    .filter((c) => !APPLICATION_HANDLES.includes(c.handle) && visible(c))
    .sort((a, b) => b.productCount - a.productCount)

  return (
    <div className="font-sans bg-white">
      <Hero />
      <StatStrip />
      <CategoryStrip categories={ingredientCards} />
      <Applications apps={appCards} />
      <ProductRow
        title="Featured Ingredients"
        desc="Premium ingredients from verified suppliers"
        products={featured}
        access={access}
        badge="Featured"
      />
      <ProductRow
        title="New Arrivals"
        desc="Recently added ingredients from verified suppliers"
        products={newArrivals}
        access={access}
        badge="New"
        tone="soft"
        viewAllHref="/store?sortBy=created_at"
      />
      <ProductRow
        title="Trending Products"
        desc="High-interest ingredients buyers are sourcing across key applications"
        products={trending}
        access={access}
        badge="Trending"
      />
      <OrderProcess />
      <InstructionVideos />
      <MarketplaceComparison />
      <GlobalPartners />
      <WhyChooseUs />
      <Testimonials />
      <CtaBanner />
    </div>
  )
}
