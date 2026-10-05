import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL()
  const countryCode = "in"

  // Fetch all products and categories
  const [productsRes, categoriesRes] = await Promise.all([
    listProducts({
      countryCode,
      queryParams: { limit: 1000, fields: "handle,updated_at" },
    }).catch(() => ({ response: { products: [] } })),
    listCategories({ limit: 100 }).catch(() => []),
  ])

  const products = productsRes.response.products || []
  const categories = categoriesRes || []

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/${countryCode}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/${countryCode}/store`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/${countryCode}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]

  // Category routes
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat: any) => ({
    url: `${baseUrl}/${countryCode}/categories/${cat.handle}`,
    lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  // Product routes
  const productRoutes: MetadataRoute.Sitemap = products.map((prod: any) => ({
    url: `${baseUrl}/${countryCode}/products/${prod.handle}`,
    lastModified: prod.updated_at ? new Date(prod.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
