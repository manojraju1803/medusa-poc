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

// Full-bleed card image: the shared frame for category and application
// cards. Falls back to the name's initials when there is no image.
export const CardImage = ({ src, alt }: { src?: string | null; alt: string }) => (
  <div className="relative aspect-[26/17] shrink-0 overflow-hidden bg-[#f6fbee]">
    {src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-[#4d7c0f]/50">
        {alt.slice(0, 2).toUpperCase()}
      </div>
    )}
  </div>
)

// Card shell shared by category and application cards.
export const CARD_CLASS =
  "group flex flex-col bg-white border border-[#f3f4f6] rounded-[14px] overflow-hidden hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-300"

// The business's own headline figures, not live catalogue counts.
const STATS = [
  { value: "21", label: "Categories" },
  { value: "150", label: "Companies" },
  { value: "350", label: "Brands" },
  { value: "150", label: "Ingredients" },
  { value: "50", label: "Indian Companies" },
]

export const StatStrip = () => (
  <section className="bg-[#f6fbee] border-y border-[#ecf6dc]">
    <div className="max-w-[1440px] mx-auto px-6 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x divide-[#d9edb8]">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center py-4 gap-1 last:col-span-2 sm:last:col-span-1"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#4d7c0f]/10 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-[#4d7c0f]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-2xl lg:text-3xl font-bold text-[#0f172a]">
                {stat.value}
              </span>
            </div>
            <span className="text-xs text-[#64748b] text-center">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
)

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
    <section className="bg-[#fafdf5] border-y border-[#ecf6dc] py-12">
      <div className="max-w-[1440px] mx-auto px-6">
        <SectionHeader
          title="Ingredients by Application"
          desc="Find the right ingredients for your specific formulation needs"
          viewAllHref="/store"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {apps.slice(0, 5).map((app) => (
            <LocalizedClientLink
              key={app.id}
              href={`/categories/${app.handle}`}
              className={CARD_CLASS}
            >
              <CardImage src={app.image} alt={app.name} />
              <div className="p-4 flex flex-col flex-1">
                <div className="text-base font-semibold text-[#0f172a] group-hover:text-[#4d7c0f] transition-colors mb-2 leading-6 line-clamp-1">
                  {app.name}
                </div>
                <p className="text-[13px] text-[#64748b] leading-5 line-clamp-2">
                  {APPLICATION_COPY[app.handle]}
                </p>
                <span className="mt-auto pt-3 inline-flex items-center gap-1 self-start text-[13px] font-semibold text-[#4d7c0f] group-hover:text-[#3f6212] transition-colors">
                  Explore <ChevronRightIcon className="w-3 h-3" />
                </span>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
