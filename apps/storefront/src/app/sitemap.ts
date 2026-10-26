import { MetadataRoute } from "next"

import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getBaseURL } from "@lib/util/env"
import { HttpTypes } from "@medusajs/types"
import { BLOG_POSTS } from "@modules/info-pages/lib/blog-posts"

const COUNTRY_CODE = "in"
const PAGE_SIZE = 200

// Public pages with fixed content.
const STATIC_PAGES: [path: string, priority: number][] = [
  ["", 1],
  ["/store", 0.9],
  ["/suppliers", 0.7],
  ["/deals", 0.7],
  ["/bulk-enquiry", 0.6],
  ["/product-development", 0.6],
  ["/promotions", 0.5],
  ["/blog", 0.5],
  ["/about-us", 0.5],
  ["/contact", 0.5],
  ["/faq", 0.5],
  ["/delivery-information", 0.4],
  ["/returns", 0.3],
  ["/privacy-policy", 0.2],
  ["/terms-and-conditions", 0.2],
]

// Every product, paging through the catalogue. No auth: handles only, and one
// cached response for every caller.
const listAllProducts = async () => {
  const products: HttpTypes.StoreProduct[] = []
  let page: number | null = 1

  while (page) {
    const { response, nextPage } = await listProducts({
      pageParam: page,
      countryCode: COUNTRY_CODE,
      withAuth: false,
      queryParams: {
        limit: PAGE_SIZE,
        order: "id",
        fields: "handle,updated_at",
      },
    })
    products.push(...response.products)
    page = nextPage
  }

  return products
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => `${getBaseURL()}/${COUNTRY_CODE}${path}`

  const [products, categories, collections] = await Promise.all([
    listAllProducts().catch(() => []),
    listCategories({ limit: 1000, fields: "handle,updated_at" }).catch(
      () => []
    ),
    listCollections({ limit: "1000", fields: "handle,updated_at" })
      .then(({ collections }) => collections)
      .catch(() => []),
  ])

  const staticRoutes: MetadataRoute.Sitemap = STATIC_PAGES.map(
    ([path, priority]) => ({
      url: url(path),
      changeFrequency: path === "" || path === "/store" ? "daily" : "monthly",
      priority,
    })
  )

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: url(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: "yearly",
    priority: 0.4,
  }))

  const lastModified = (date?: string | Date | null) =>
    date ? new Date(date) : undefined

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((c) => c.handle)
    .map((c) => ({
      url: url(`/categories/${c.handle}`),
      lastModified: lastModified(c.updated_at),
      changeFrequency: "weekly",
      priority: 0.8,
    }))

  const collectionRoutes: MetadataRoute.Sitemap = collections
    .filter((c) => c.handle)
    .map((c) => ({
      url: url(`/collections/${c.handle}`),
      lastModified: lastModified(c.updated_at),
      changeFrequency: "weekly",
      priority: 0.6,
    }))

  const productRoutes: MetadataRoute.Sitemap = products
    .filter((p) => p.handle)
    .map((p) => ({
      url: url(`/products/${p.handle}`),
      lastModified: lastModified(p.updated_at),
      changeFrequency: "weekly",
      priority: 0.85,
    }))

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...collectionRoutes,
    ...productRoutes,
    ...blogRoutes,
  ]
}
