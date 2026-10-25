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

// Card image on a tinted panel: the shared frame for category and
// application cards.
export const CardImage = ({ src, alt }: { src?: string | null; alt: string }) => (
  <div className="relative h-[160px] m-2.5 mb-0 rounded-xl overflow-hidden border border-[#e6f2d6] bg-gradient-to-br from-[#f6fbee] via-white to-[#eaf5fc]">
    {src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="relative w-full h-full object-contain p-3 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
      />
    ) : (
      <div className="relative w-full h-full flex items-center justify-center text-3xl font-extrabold text-[#4d7c0f]/50">
        {alt.slice(0, 2).toUpperCase()}
      </div>
    )}
  </div>
)

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
          <div key={stat.label} className="flex flex-col items-center py-4 gap-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#4d7c0f]/10 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#4d7c0f]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-2xl lg:text-3xl font-extrabold text-[#0f172a]">
                {stat.value}
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
    <section className="bg-[#fafdf5] border-y border-[#e6f2d6] py-12">
      <div className="max-w-[1440px] mx-auto px-6">
        <SectionHeader
          title="Ingredients by Application"
          desc="Find the right ingredients for your formulation needs"
          viewAllHref="/store"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {apps.slice(0, 5).map((app) => (
            <LocalizedClientLink
              key={app.id}
              href={`/categories/${app.handle}`}
              className="group flex flex-col bg-white border-2 border-[#cfe5f4] rounded-2xl overflow-hidden shadow-[0_4px_14px_rgba(12,59,94,0.08)] hover:shadow-[0_16px_34px_rgba(22,119,184,0.18)] hover:-translate-y-1 hover:border-[#0077cf] transition-all duration-300"
            >
              <span className="h-1.5 shrink-0 bg-gradient-to-r from-[#0077cf] via-[#3d996e] to-[#7aba0c]" />
              <CardImage src={app.image} alt={app.name} />
              <div className="p-4 flex flex-col flex-1">
                <div className="text-base font-bold text-[#0f172a] group-hover:text-[#0077cf] transition-colors mb-1.5 leading-snug">
                  {app.name}
                </div>
                <p className="text-xs text-[#64748b] leading-relaxed line-clamp-2">
                  {APPLICATION_COPY[app.handle]}
                </p>
                <span className="mt-auto pt-3 self-start">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#eaf5fc] text-[#0077cf] text-xs font-bold group-hover:bg-[#0077cf] group-hover:text-white transition-colors">
                    Explore <ChevronRightIcon className="w-3 h-3" />
                  </span>
                </span>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
