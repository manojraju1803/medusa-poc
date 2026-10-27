import { retrieveCustomer } from "@lib/data/customer"
import { listProducts } from "@lib/data/products"
import { minQuantityOf } from "@lib/util/min-quantity"
import { isRealProductImageUrl } from "@lib/util/product-image"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CompareSync, {
  CompareClear,
  CompareRemove,
} from "@modules/products/components/compare-sync"
import { CardPrice } from "@modules/products/components/product-card"
import { UNIT, hsnOf, viewerFor } from "@modules/products/lib/access"
import { CARD_FIELDS } from "@modules/products/lib/fields"
import { COMPARE_MAX } from "@modules/products/lib/compare-constants"
import { NOINDEX } from "@lib/util/seo"
import { Metadata } from "next"
import Image from "next/image"

// Per-visitor selection of products: nothing here for search engines.
export const metadata: Metadata = {
  title: "Compare ingredients",
  description: "Compare ingredients side by side.",
  robots: NOINDEX,
}

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ ids?: string }>
}

export default async function ComparePage(props: Props) {
  const { countryCode } = await props.params
  const { ids: rawIds } = await props.searchParams
  const ids = Array.from(new Set((rawIds ?? "").split(",").filter(Boolean))).slice(
    0,
    COMPARE_MAX
  )

  const [products, customer] = await Promise.all([
    ids.length
      ? listProducts({
          countryCode,
          queryParams: {
            id: ids,
            limit: COMPARE_MAX,
            fields: `${CARD_FIELDS},categories.name,+variants.inventory_quantity,variants.manage_inventory`,
          },
        }).then(({ response }) => response.products)
      : Promise.resolve([] as HttpTypes.StoreProduct[]),
    retrieveCustomer(),
  ])
  // Keep the order the buyer added them in.
  const ordered = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is HttpTypes.StoreProduct => !!p)
  const viewer = viewerFor(customer, ordered)
  const approved = viewer === "approved"

  const stockOf = (p: HttpTypes.StoreProduct) => {
    const v = p.variants?.[0]
    if (!v?.manage_inventory || typeof v.inventory_quantity !== "number") return "—"
    return v.inventory_quantity > 0
      ? `${v.inventory_quantity.toLocaleString("en-IN")} ${UNIT}`
      : "Out of stock"
  }

  const rows: [string, (p: HttpTypes.StoreProduct) => React.ReactNode][] = [
    [
      "Brand",
      (p) =>
        p.collection ? (
          <LocalizedClientLink
            href={`/collections/${p.collection.handle}`}
            className="text-[#0077cf] hover:text-[#4d7c0f]"
          >
            {p.collection.title}
          </LocalizedClientLink>
        ) : (
          "—"
        ),
    ],
    ["MOQ", (p) => `${minQuantityOf(p.variants?.[0])} ${UNIT}`],
    ["HSN", (p) => hsnOf(p) ?? "—"],
    [
      "Category",
      (p) => p.categories?.map((c) => c.name).join(", ") || "—",
    ],
    ["Price", (p) => <CardPrice product={p} viewer={viewer} />],
    ...(approved
      ? ([["Stock (Bangalore)", (p: HttpTypes.StoreProduct) => stockOf(p)]] as [
          string,
          (p: HttpTypes.StoreProduct) => React.ReactNode,
        ][])
      : []),
  ]

  return (
    <div className="bg-[#f7faf9] min-h-screen">
      <CompareSync urlIds={ids} />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <nav className="flex items-center gap-2 text-xs text-[#64748b] mb-5">
          <LocalizedClientLink href="/" className="hover:text-[#4d7c0f]">Home</LocalizedClientLink>
          <span>›</span>
          <LocalizedClientLink href="/store" className="hover:text-[#4d7c0f]">Ingredients</LocalizedClientLink>
          <span>›</span>
          <span className="text-[#0f172a] font-medium">Compare</span>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
          <div>
            <h1 className="text-sm font-bold text-[#0f172a]">Comparing {ordered.length} Ingredients</h1>
            <p className="text-[10px] text-[#6b7280]">
              Select up to {COMPARE_MAX} products to compare side by side
            </p>
          </div>
          {ordered.length > 0 && <CompareClear />}
        </div>

        {ordered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center" data-testid="compare-empty">
            <h2 className="text-lg font-bold text-[#0f172a] mb-1">Nothing to compare yet</h2>
            <p className="text-sm text-[#64748b] mb-4">
              Tick “Compare” on up to {COMPARE_MAX} ingredients to see them side by side.
            </p>
            <LocalizedClientLink
              href="/store"
              className="inline-block px-4 py-2 bg-[#4d7c0f] hover:bg-[#3f6212] text-white text-sm font-semibold rounded-lg"
            >
              Browse ingredients
            </LocalizedClientLink>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm" data-testid="compare-table">
              <thead>
                <tr>
                  <th className="w-[160px] bg-[#fafdf5] border-b border-gray-100 px-4 py-4 text-left text-[10px] font-bold uppercase text-[#6b7280] align-top">Feature</th>
                  {ordered.map((p) => {
                    const src = [p.thumbnail, ...(p.images?.map((i) => i.url) ?? [])].find(
                      isRealProductImageUrl
                    )
                    return (
                      <th key={p.id} className="border-b border-gray-100 px-4 py-4 bg-white min-w-[200px] align-top text-left font-normal">
                        <div className="relative aspect-square w-full max-w-[180px] rounded-xl border border-gray-100 bg-white overflow-hidden mb-3">
                          {src && (
                            <Image src={src} alt={p.title ?? ""} fill sizes="180px" className="object-contain p-2" />
                          )}
                        </div>
                        <LocalizedClientLink
                          href={`/products/${p.handle}`}
                          className="block text-sm font-bold text-[#0f172a] hover:text-[#4d7c0f] line-clamp-2"
                        >
                          {p.title}
                        </LocalizedClientLink>
                        <div className="mt-1">
                          <CompareRemove productId={p.id} />
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, render], ri) => (
                  <tr key={label} className={ri % 2 === 0 ? "bg-white" : "bg-[#fafdf5]"}>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-[#6b7280] uppercase tracking-wide whitespace-nowrap align-top">
                      {label}
                    </th>
                    {ordered.map((p) => (
                      <td key={p.id} className="px-4 py-3 text-xs text-[#374151] align-top">
                        {render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-[#fafdf5]">
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-[#6b7280] uppercase">Actions</th>
                  {ordered.map((p) => (
                    <td key={p.id} className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <LocalizedClientLink
                          href={`/products/${p.handle}#inquiry`}
                          className="w-full py-1.5 text-center bg-[#4d7c0f] text-white text-[10px] font-bold rounded-lg hover:bg-[#3f6212] transition-colors"
                        >
                          Request Quote
                        </LocalizedClientLink>
                        <LocalizedClientLink
                          href={`/products/${p.handle}#inquiry`}
                          className="w-full py-1.5 text-center border border-[#4d7c0f]/40 text-[#4d7c0f] text-[10px] font-bold rounded-lg hover:bg-[#f6fbee] transition-colors"
                        >
                          Request Sample
                        </LocalizedClientLink>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
