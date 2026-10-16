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
  const rawQ = req.query.q as string | undefined
  const q = rawQ ? rawQ.trim() : ""
  const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20)

  if (!q || q.length < 3) {
    res.json({ products: [] })
    return
  }

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // Sales channel scoping (from publishable key context or query param)
    const salesChannelIds: string[] = []
    const reqWithContext = req as MedusaRequest & {
      publishable_key_context?: {
        sales_channel_ids?: string[]
      }
    }

    if (reqWithContext.publishable_key_context?.sales_channel_ids?.length) {
      salesChannelIds.push(...reqWithContext.publishable_key_context.sales_channel_ids)
    }

    const querySalesChannelId = req.query.sales_channel_id
    if (querySalesChannelId) {
      if (Array.isArray(querySalesChannelId)) {
        salesChannelIds.push(...(querySalesChannelId as string[]))
      } else if (typeof querySalesChannelId === "string") {
        salesChannelIds.push(querySalesChannelId)
      }
    }

    const uniqueSalesChannelIds = Array.from(new Set(salesChannelIds.filter(Boolean)))

    let validProductIds: string[] | null = null
    if (uniqueSalesChannelIds.length > 0) {
      try {
        const { data: channelLinks } = await query.graph({
          entity: "product_sales_channel",
          fields: ["product_id"],
          filters: {
            sales_channel_id: uniqueSalesChannelIds,
          },
        })
        validProductIds = (channelLinks || []).map((l: any) => l.product_id)
        if (validProductIds.length === 0) {
          // No products available in this sales channel
          res.json({ products: [] })
          return
        }
      } catch (scErr) {
        console.error("Error querying product_sales_channel links for sales channel filter:", scErr)
      }
    }

    const isInSalesChannel = (prod: any): boolean => {
      if (uniqueSalesChannelIds.length === 0) {
        return true
      }
      if (validProductIds !== null) {
        return validProductIds.includes(prod.id)
      }
      if (Array.isArray(prod.sales_channels)) {
        return prod.sales_channels.some((sc: any) =>
          uniqueSalesChannelIds.includes(sc.id)
        )
      }
      return false
    }

    // 1. Query products matching title or handle with sales channel filter
    const productFilters: Record<string, any> = {
      status: "published",
      $or: [
        { title: { $ilike: `%${q}%` } },
        { handle: { $ilike: `%${q}%` } },
      ],
    }

    if (validProductIds !== null) {
      productFilters.id = validProductIds
    }

    const { data: titleProducts } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "thumbnail",
        "status",
        "brand.name",
        "sales_channels.id",
      ],
      filters: productFilters,
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
          "products.id",
          "products.title",
          "products.handle",
          "products.thumbnail",
          "products.status",
          "products.sales_channels.id",
          "product.id",
          "product.title",
          "product.handle",
          "product.thumbnail",
          "product.status",
          "product.sales_channels.id",
        ],
        filters: {
          name: { $ilike: `%${q}%` },
        },
      })

      if (matchingBrands && matchingBrands.length > 0) {
        for (const brand of matchingBrands) {
          const brandObj = brand as any
          const prods = Array.isArray(brandObj.products)
            ? brandObj.products
            : Array.isArray(brandObj.product)
            ? brandObj.product
            : brandObj.product
            ? [brandObj.product]
            : []

          for (const prod of prods) {
            if (prod && prod.status === "published" && isInSalesChannel(prod)) {
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
    } catch (err) {
      console.error("Error querying brand suggestions:", err)
    }

    // 3. Deduplicate by product ID
    const productMap = new Map<string, SuggestionProduct>()

    for (const prod of titleProducts || []) {
      if (!isInSalesChannel(prod)) {
        continue
      }
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
  } catch (error) {
    console.error("Error generating search suggestions:", error)
    res.status(500).json({ message: "Failed to generate search suggestions" })
  }
}

