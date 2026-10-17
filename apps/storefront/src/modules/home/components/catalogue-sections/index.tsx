import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRightIcon } from "@modules/layout/components/ib-icons"
import SectionHeader from "../section-header"

export type CategoryCard = {
  id: string
  name: string
  handle: string
  productCount: number
  subCount: number
  image?: string | null
}

const Thumb = ({ src, alt }: { src?: string | null; alt: string }) =>
  src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="w-full h-full object-contain p-2 bg-white group-hover:scale-105 transition-transform duration-300"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] text-2xl font-extrabold text-[#006B4F]/60">
      {alt.slice(0, 2).toUpperCase()}
    </div>
  )

// Round down to an honest "90+" style figure.
const roundStat = (n: number) =>
  n >= 10 ? `${(Math.floor(n / 10) * 10).toLocaleString("en-IN")}+` : String(n)

export const StatStrip = ({
  stats,
}: {
  stats: { value: number; label: string }[]
}) => {
  const shown = stats.filter((s) => s.value > 0)
  if (!shown.length) return null

  return (
    <section className="bg-[#f0fdf4] border-y border-[#dcfce7]">
      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <div
          className={`grid grid-cols-2 ${
            shown.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
          } lg:divide-x divide-[#bbf7d0]`}
        >
          {shown.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center py-4 gap-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#006B4F]/10 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#006B4F]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-2xl lg:text-3xl font-extrabold text-[#0f172a]">
                  {roundStat(stat.value)}
                </span>
              </div>
              <span className="text-xs font-medium text-[#64748b] text-center">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const APPLICATION_COPY: Record<string, string> = {
  bakery: "Ingredients for breads, biscuits, cakes and baked goods",
  beverage: "Functional ingredients for drinks and fortified beverages",
  confectionery: "Cocoa, sweeteners and inclusions for confectionery",
  dairy: "Proteins, powders and milk-based ingredient solutions",
  "ice-cream": "Stabilisers, fats and flavours for frozen desserts",
  "ready-to-label": "Ready-to-label formulations for private brands",
}

export const APPLICATION_HANDLES = Object.keys(APPLICATION_COPY)

export const Applications = ({ apps }: { apps: CategoryCard[] }) => {
  if (!apps.length) return null

  return (
    <section className="bg-[#f8fffe] border-y border-[#e2f3eb] py-12">
      <div className="max-w-[1440px] mx-auto px-6">
        <SectionHeader
          title="Ingredients by Application"
          desc="Find the right ingredients for your formulation needs"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {apps.map((app) => (
            <LocalizedClientLink
              key={app.id}
              href={`/categories/${app.handle}`}
              className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-[#006B4F]/30 hover:shadow-md transition-all"
            >
              <div className="h-[100px] bg-green-50 overflow-hidden">
                <Thumb src={app.image} alt={app.name} />
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold text-[#0f172a] group-hover:text-[#006B4F] transition-colors mb-1 leading-snug">
                  {app.name}
                </div>
                <p className="text-[10px] text-[#9ca3af] leading-snug line-clamp-2">
                  {APPLICATION_COPY[app.handle]}
                </p>
                <div className="flex items-center gap-1 mt-2 text-[#006B4F] text-xs font-medium">
                  Explore <ChevronRightIcon className="w-3 h-3" />
                </div>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}

export const TrustedBrands = ({
  brands,
  productCounts,
}: {
  brands: HttpTypes.StoreCollection[]
  productCounts: Record<string, number>
}) => {
  if (!brands.length) return null

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-10">
      <div className="text-center mb-7">
        <div className="text-xs font-bold text-[#006B4F] uppercase tracking-wider mb-2">
          Our Trusted Brands
        </div>
        <h2 className="text-2xl font-bold text-[#0f172a] mb-1">
          Partnered with Leading Brands
        </h2>
        <p className="text-sm text-[#64748b]">
          Sourcing from {brands.length} brand{brands.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {brands.slice(0, 16).map((brand) => {
          const logo = brand.metadata?.logo as string | undefined
          const count = productCounts[brand.id] ?? 0
          return (
            <LocalizedClientLink
              key={brand.id}
              href={`/collections/${brand.handle}`}
              className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1.5 hover:border-[#006B4F]/25 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 bg-[#f0fdf4] border border-[#dcfce7] rounded-full flex items-center justify-center overflow-hidden">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[11px] font-extrabold text-[#006B4F]">
                    {brand.title.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-[11px] font-bold text-[#0f172a] text-center leading-snug group-hover:text-[#006B4F] transition-colors line-clamp-2">
                {brand.title}
              </div>
              {count > 0 && (
                <div className="text-[10px] text-[#9ca3af]">
                  {count} product{count === 1 ? "" : "s"}
                </div>
              )}
            </LocalizedClientLink>
          )
        })}
      </div>
      {brands.length > 16 && (
        <div className="text-center mt-6">
          <LocalizedClientLink
            href="/suppliers"
            className="text-sm font-semibold text-[#006B4F] hover:text-[#005a42]"
          >
            View all {brands.length} brands →
          </LocalizedClientLink>
        </div>
      )}
    </section>
  )
}
