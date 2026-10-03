import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export type SuggestionProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  brand_name: string | null
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const rawQ = req.query.q as string | undefined
  const q = rawQ ? rawQ.trim() : ""
  const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20)

  if (!q || q.length < 3) {
    res.json({ products: [] })
    return
  }

  // 1. Query products matching title or handle
  const { data: titleProducts } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "thumbnail",
      "status",
      "brand.name",
    ],
    filters: {
      status: "published",
      $or: [
        { title: { $ilike: `%${q}%` } },
        { handle: { $ilike: `%${q}%` } },
      ],
    },
    pagination: {
      take: limit,
    },
  })

  // 2. Query brands matching name and retrieve linked products
  const brandProducts: {
    id: string
    title: string
    handle: string
    thumbnail: string | null
    status: string
    brand_name: string | null
  }[] = []

  try {
    const { data: matchingBrands } = await query.graph({
      entity: "brand",
      fields: [
        "id",
        "name",
        "product.id",
        "product.title",
        "product.handle",
        "product.thumbnail",
        "product.status",
      ],
      filters: {
        name: { $ilike: `%${q}%` },
      },
    })

    if (matchingBrands && matchingBrands.length > 0) {
      for (const brand of matchingBrands) {
        const brandObj = brand as any
        const prods = Array.isArray(brandObj.product)
          ? brandObj.product
          : brandObj.product
          ? [brandObj.product]
          : Array.isArray(brandObj.products)
          ? brandObj.products
          : []

        for (const prod of prods) {
          if (prod && prod.status === "published") {
            brandProducts.push({
              id: prod.id,
              title: prod.title,
              handle: prod.handle,
              thumbnail: prod.thumbnail,
              status: prod.status,
              brand_name: brand.name,
            })
          }
        }
      }
    }
  } catch (_err) {
    // Brand link or table might be empty or unmigrated
  }


  // 3. Deduplicate by product ID
  const productMap = new Map<string, SuggestionProduct>()

  for (const prod of titleProducts || []) {
    const brand = (prod as { brand?: { name?: string } }).brand
    productMap.set(prod.id, {
      id: prod.id,
      title: prod.title,
      handle: prod.handle,
      thumbnail: prod.thumbnail ?? null,
      brand_name: brand?.name ?? null,
    })
  }

  for (const prod of brandProducts) {
    if (!productMap.has(prod.id)) {
      productMap.set(prod.id, {
        id: prod.id,
        title: prod.title,
        handle: prod.handle,
        thumbnail: prod.thumbnail ?? null,
        brand_name: prod.brand_name ?? null,
      })
    }
  }

  const results = Array.from(productMap.values()).slice(0, limit)

  // Strict requirement: Suggestions contain product name and image only (no prices)
  res.json({ products: results })
}
