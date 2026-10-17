import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { PRODUCT_CARD_FIELDS } from "@lib/util/product"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import PageBanner from "@modules/suppliers/components/page-banner"
import SupplierCard from "@modules/suppliers/components/supplier-card"
import { searchSuppliers } from "@modules/suppliers/data"

const PAGE_SIZE = 24

const SearchForm = ({ q }: { q: string }) => (
  <form method="GET" className="mt-4 flex max-w-xl gap-2">
    <input
      name="q"
      defaultValue={q}
      placeholder="Search ingredients or brands…"
      className="flex-1 px-4 py-2.5 text-sm rounded-xl outline-none bg-white text-[#0f172a]"
      data-testid="search-page-input"
    />
    <button
      type="submit"
      className="px-5 py-2.5 bg-[#4ade80] hover:bg-[#22c55e] text-[#052e16] text-sm font-bold rounded-xl transition-colors"
    >
      Search
    </button>
  </form>
)

export default async function SearchTemplate({
  q,
  page,
  countryCode,
}: {
  q: string
  page: number
  countryCode: string
}) {
  const term = q.trim()
  const region = await getRegion(countryCode)

  if (!term || !region) {
    return (
      <div className="min-h-[60vh] bg-[#f8fffe]">
        <PageBanner title="Search" subtitle="Find ingredients and brands">
          <SearchForm q={term} />
        </PageBanner>
      </div>
    )
  }

  const [brands, productResult] = await Promise.all([
    searchSuppliers(term),
    listProducts({
      pageParam: page,
      countryCode,
      queryParams: { q: term, limit: PAGE_SIZE, fields: PRODUCT_CARD_FIELDS },
    }),
  ])
  const { products, count } = productResult.response
  const totalPages = Math.ceil(count / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-[#f8fffe]" data-testid="search-page">
      <PageBanner
        title={`Results for “${term}”`}
        subtitle={`${brands.length} ${brands.length === 1 ? "brand" : "brands"} · ${count} ${count === 1 ? "product" : "products"}`}
      >
        <SearchForm q={term} />
      </PageBanner>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-10">
        {brands.length > 0 && (
          <section data-testid="search-brands">
            <h2 className="text-lg font-bold text-[#0f172a] mb-4">Brands</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {brands.map((b) => (
                <SupplierCard key={b.id} supplier={b} />
              ))}
            </div>
          </section>
        )}
        <section data-testid="search-products">
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">Products</h2>
          {products.length ? (
            <>
              <ul className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
                {products.map((p) => (
                  <li key={p.id}>
                    <ProductPreview product={p} region={region} />
                  </li>
                ))}
              </ul>
              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} />
              )}
            </>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-sm text-[#64748b]">
              No products match “{term}”.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
