import "server-only"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

// Brand = supplier = product collection. Optional extras live in its metadata.
export type Supplier = {
  id: string
  title: string
  handle: string
  country?: string
  description?: string
  logo?: string
  productCount: number
}

const metaText = (meta: Record<string, unknown> | null | undefined, key: string) =>
  typeof meta?.[key] === "string" && (meta[key] as string).trim()
    ? (meta[key] as string).trim()
    : undefined

export const toSupplier = (
  collection: HttpTypes.StoreCollection,
  productCount = 0
): Supplier => ({
  id: collection.id,
  title: collection.title,
  handle: collection.handle,
  country: metaText(collection.metadata, "country"),
  description: metaText(collection.metadata, "description"),
  logo: metaText(collection.metadata, "logo"),
  productCount,
})

const FETCH_OPTS = { cache: "force-cache" as const, next: { revalidate: 60 } }

async function listAllCollections(): Promise<HttpTypes.StoreCollection[]> {
  return sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[] }>("/store/collections", {
      query: { limit: 200, fields: "id,title,handle,metadata" },
      ...FETCH_OPTS,
    })
    .then(({ collections }) => collections)
    .catch(() => [])
}

// Product counts per collection, from one paged id-only product listing.
async function countProductsByCollection(): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  const limit = 500
  for (let offset = 0; offset < 5000; offset += limit) {
    const res = await sdk.client
      .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
        "/store/products",
        { query: { limit, offset, fields: "id,collection_id" }, ...FETCH_OPTS }
      )
      .catch(() => null)
    if (!res) break
    for (const p of res.products) {
      if (p.collection_id) {
        counts.set(p.collection_id, (counts.get(p.collection_id) || 0) + 1)
      }
    }
    if (offset + limit >= res.count) break
  }
  return counts
}

export async function listSuppliers(): Promise<Supplier[]> {
  const [collections, counts] = await Promise.all([
    listAllCollections(),
    countProductsByCollection(),
  ])
  return collections
    .map((c) => toSupplier(c, counts.get(c.id) || 0))
    // Hide brands with nothing visible in this store's sales channel.
    .filter((s) => !counts.size || s.productCount > 0)
    .sort((a, b) => a.title.localeCompare(b.title))
}

// Collection by handle, with its metadata (not in the store API's defaults).
export async function getCollectionWithMetadata(
  handle: string
): Promise<HttpTypes.StoreCollection | null> {
  return sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[] }>("/store/collections", {
      query: { handle, fields: "id,title,handle,metadata" },
      ...FETCH_OPTS,
    })
    .then(({ collections }) => collections[0] || null)
    .catch(() => null)
}

export async function countCollectionProducts(collectionId: string) {
  return sdk.client
    .fetch<{ count: number }>("/store/products", {
      query: { limit: 1, collection_id: [collectionId], fields: "id" },
      ...FETCH_OPTS,
    })
    .then(({ count }) => count)
    .catch(() => 0)
}

export async function searchSuppliers(q: string): Promise<Supplier[]> {
  const term = q.trim().toLowerCase()
  if (!term) return []
  const suppliers = await listSuppliers()
  return suppliers.filter((s) => s.title.toLowerCase().includes(term))
}
