import { retrieveCustomer } from "@lib/data/customer"
import { listPriceTiers } from "@lib/data/price-tiers"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { minQuantityOf } from "@lib/util/min-quantity"
import { isRealProductImageUrl } from "@lib/util/product-image"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPlaceholder from "@modules/common/icons/product-placeholder"
import {
  UNIT,
  Viewer,
  tierSaving,
  viewerFor,
} from "@modules/products/lib/access"
import Image from "next/image"

const FIELDS =
  "id,title,handle,thumbnail,+metadata,collection.title,categories.id,categories.name,images.url,variants.id,variants.metadata,*variants.calculated_price"

type Saving = { percent: number; from: number }
type Deal = { product: HttpTypes.StoreProduct; saving?: Saving }

const DealCard = ({ deal, viewer }: { deal: Deal; viewer: Viewer }) => {
  const { product, saving } = deal
  const src = [
    product.thumbnail,
    ...(product.images?.map((i) => i.url) ?? []),
  ].find(isRealProductImageUrl)
  const category = product.categories?.[0]?.name
  const moq = product.variants?.[0]
    ? minQuantityOf(product.variants[0])
    : undefined
  const showSaving = viewer === "approved" && saving
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-[#006B4F]/30 hover:shadow-[0_4px_20px_rgba(0,107,79,0.08)] transition-all flex flex-col group">
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="relative block bg-gray-50 overflow-hidden aspect-square"
      >
        {src ? (
          <Image
            src={src}
            alt={product.title ?? ""}
            fill
            sizes="300px"
            className="object-contain p-3"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ProductPlaceholder />
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {showSaving ? (
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-red-500 text-white rounded">
              -{saving.percent}% OFF
            </span>
          ) : (
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#006B4F] text-white rounded">
              Bulk Deal
            </span>
          )}
        </div>
      </LocalizedClientLink>
      <div className="p-3 flex flex-col flex-1">
        <div className="mb-1">
          <LocalizedClientLink href={`/products/${product.handle}`}>
            <h3 className="font-bold text-[#0f172a] text-[11px] leading-snug group-hover:text-[#006B4F] transition-colors line-clamp-2">
              {product.title}
            </h3>
          </LocalizedClientLink>
          {product.collection?.title && (
            <p className="text-[9px] text-[#6b7280] mt-0.5 truncate">
              {product.collection.title}
            </p>
          )}
        </div>
        {category && (
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="px-1 py-0.5 text-[8px] font-medium bg-[#f0fdf4] border border-[#dcfce7] text-[#006B4F] rounded">
              {category}
            </span>
          </div>
        )}
        <div className="mb-2">
          {showSaving ? (
            <span className="text-sm font-extrabold text-[#006B4F]">
              Save {saving.percent}% at {saving.from}+ {UNIT}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-[#0757a8]">
              {viewer === "guest"
                ? "Bulk discount available, login to view"
                : "Bulk discount available after approval"}
            </span>
          )}
        </div>
        {moq ? (
          <div className="flex flex-wrap gap-0.5 mb-2">
            <span className="px-1 py-0.5 text-[7px] font-medium text-[#6b7280]">
              MOQ: {moq} {UNIT}
            </span>
          </div>
        ) : null}
        <LocalizedClientLink
          href={viewer === "guest" ? "/account" : `/products/${product.handle}`}
          className="block text-center w-full py-2 text-[10px] font-bold rounded-lg mt-auto transition-all bg-[#006B4F] hover:bg-[#005a42] text-white"
        >
          {viewer === "guest" ? "Login to View Deal" : "View Deal"}
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default async function DealsTemplate({
  countryCode,
  category,
  sort,
}: {
  countryCode: string
  category?: string
  sort: "featured" | "discount"
}) {
  const [region, customer, { response }] = await Promise.all([
    getRegion(countryCode),
    retrieveCustomer(),
    listProducts({
      countryCode,
      queryParams: { limit: 100, fields: FIELDS, order: "title" },
    }),
  ])
  const products = response.products
  const viewer = viewerFor(customer, products)

  let deals: Deal[]
  if (viewer === "approved" && region) {
    const tiers = await listPriceTiers({
      productIds: products.map((p) => p.id),
      regionId: region.id,
    })
    const byVariant = new Map(tiers.map((t) => [t.variant_id, t.tiers]))
    deals = products
      .map((product) => {
        const best = (product.variants ?? [])
          .map((v) => tierSaving(byVariant.get(v.id)))
          .filter((s): s is Saving => !!s)
          .sort((a, b) => b.percent - a.percent)[0]
        return { product, saving: best }
      })
      .filter((d) => d.saving)
  } else {
    // Slabs are only readable by approved buyers, so others see the
    // catalogue with the discount hidden.
    deals = products.map((product) => ({ product }))
  }

  const cats = new Map<string, string>()
  deals.forEach((d) =>
    d.product.categories?.forEach((c) => cats.set(c.id, c.name))
  )
  const shown = deals
    .filter(
      (d) => !category || d.product.categories?.some((c) => c.id === category)
    )
    .sort((a, b) =>
      sort === "discount"
        ? (b.saving?.percent ?? 0) - (a.saving?.percent ?? 0)
        : 0
    )

  const link = (p: { category?: string; sort?: string }) => {
    const merged: Record<string, string | undefined> = {
      category,
      sort: sort === "discount" ? "discount" : undefined,
      ...p,
    }
    const s = new URLSearchParams(
      Object.entries(merged).filter((e): e is [string, string] => !!e[1])
    ).toString()
    return `/deals${s ? `?${s}` : ""}`
  }

  return (
    <div className="min-h-screen bg-[#f8fffe]">
      <section className="relative overflow-hidden bg-[#0d3320]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d3320] via-[#0d3320]/90 to-[#0d3320]/60" />
        <div className="relative max-w-[1440px] mx-auto px-6 py-10">
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            Deal of the Month — Bulk Savings
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] mb-3">
            Premium Ingredients.
            <br />
            <span className="text-[#4ade80]">Special Prices.</span>
            <br />
            Greater Possibilities.
          </h1>
          <p className="text-[#bbf7d0]/80 text-sm leading-relaxed mb-6 max-w-lg">
            Quantity-slab discounts for approved buyers. The more you order,
            the more you save.
          </p>
          <div className="flex flex-wrap gap-4 mb-7">
            {["Exclusive Pricing", "Trusted Suppliers", "Quality Assured"].map(
              (t) => (
                <span key={t} className="text-xs text-[#86efac] font-medium">
                  ✓ {t}
                </span>
              )
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="#deals"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4ade80] hover:bg-[#22c55e] text-[#052e16] font-bold text-sm rounded-lg transition-colors"
            >
              Explore All Deals →
            </a>
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/30 text-white hover:border-white/60 font-semibold text-sm rounded-lg transition-colors"
            >
              Browse Catalog
            </LocalizedClientLink>
          </div>
        </div>
      </section>

      <div id="deals" className="max-w-[1440px] mx-auto px-6 py-7">
        <div className="flex flex-col lg:flex-row gap-5">
          <aside className="w-full lg:w-[220px] flex-shrink-0">
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Filter Deals
                </h3>
                {category && (
                  <LocalizedClientLink
                    href={link({ category: "" })}
                    className="text-[10px] font-semibold text-[#0757a8]"
                  >
                    Clear All
                  </LocalizedClientLink>
                )}
              </div>
              <div className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider mb-2">
                Category
              </div>
              <ul className="space-y-1.5">
                {Array.from(cats.entries())
                  .sort((a, b) => a[1].localeCompare(b[1]))
                  .map(([id, name]) => (
                    <li key={id}>
                      <LocalizedClientLink
                        href={link({ category: category === id ? "" : id })}
                        className={`flex items-center gap-2 text-xs ${
                          category === id
                            ? "text-[#006B4F] font-semibold"
                            : "text-[#374151] hover:text-[#006B4F]"
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 text-[9px] rounded border flex items-center justify-center ${
                            category === id
                              ? "bg-[#006B4F] border-[#006B4F] text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {category === id ? "✓" : ""}
                        </span>
                        {name}
                      </LocalizedClientLink>
                    </li>
                  ))}
              </ul>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 mb-4">
              <span className="text-sm text-[#6b7280]">
                <strong className="text-[#0f172a]">{shown.length}</strong>{" "}
                deals
              </span>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[#6b7280]">Sort by:</span>
                <LocalizedClientLink
                  href={link({ sort: "" })}
                  className={
                    sort === "featured"
                      ? "font-bold text-[#006B4F]"
                      : "text-[#374151]"
                  }
                >
                  Featured
                </LocalizedClientLink>
                {viewer === "approved" && (
                  <LocalizedClientLink
                    href={link({ sort: "discount" })}
                    className={
                      sort === "discount"
                        ? "font-bold text-[#006B4F]"
                        : "text-[#374151]"
                    }
                  >
                    Highest Discount
                  </LocalizedClientLink>
                )}
              </div>
            </div>
            {shown.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {shown.map((d) => (
                  <DealCard key={d.product.id} deal={d} viewer={viewer} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6b7280] bg-white border border-gray-100 rounded-xl p-8 text-center">
                No deals right now.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
