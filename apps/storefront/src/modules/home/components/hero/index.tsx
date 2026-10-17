import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ArrowRightIcon,
  BoxIcon,
  ChartIcon,
  DocIcon,
  TruckIcon,
} from "@modules/layout/components/ib-icons"

export const TRUST_FEATURES = [
  {
    Icon: DocIcon,
    title: "Quality Assured",
    desc: "Products come with COA, lab reports and certifications",
  },
  {
    Icon: BoxIcon,
    title: "Bulk Ordering",
    desc: "Per-product minimum order quantities with tiered slab pricing",
  },
  {
    Icon: ChartIcon,
    title: "Live Inventory",
    desc: "Stock availability and pricing for approved buyers",
  },
  {
    Icon: TruckIcon,
    title: "Fast Delivery",
    desc: "Dispatch from our Bangalore warehouse with logistics support",
  },
]

const Hero = () => {
  return (
    <section className="relative min-h-[520px] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-[#052e16]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/home-hero.jpg"
          alt="Natural ingredient powders and botanical extracts in a laboratory"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#052e16]/[.92] via-[#052e16]/[.76] to-[#052e16]/[.15]" />
      </div>
      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 w-full py-16">
        <div className="grid lg:grid-cols-[1fr_340px] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-[#86efac] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-pulse" />
              The B2B Ingredient Marketplace
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] mb-4">
              Source Premium
              <br />
              <span className="text-[#4ade80]">Ingredients</span> from
              <br />
              Verified Suppliers
            </h1>
            <p className="text-[#bbf7d0]/90 text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
              Bulk food and nutraceutical ingredients from trusted brands, with
              live inventory, slab pricing for approved buyers and full quality
              documentation.
            </p>
            <div className="flex flex-wrap gap-3">
              <LocalizedClientLink
                href="/store"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4ade80] hover:bg-[#22c55e] text-[#052e16] font-semibold text-sm rounded-lg transition-colors"
              >
                Browse Ingredients <ArrowRightIcon className="w-4 h-4" />
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border border-white/30 hover:border-white/60 text-white font-semibold text-sm rounded-lg transition-colors"
              >
                Post a Requirement
              </LocalizedClientLink>
            </div>
          </div>
          <div className="hidden lg:flex flex-col gap-3">
            {TRUST_FEATURES.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="bg-[#052e16]/50 backdrop-blur-md border border-white/20 rounded-xl p-4 flex gap-3 hover:bg-[#052e16]/60 transition-colors"
              >
                <span className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center text-[#86efac]">
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <div className="text-white font-semibold text-sm mb-0.5">
                    {title}
                  </div>
                  <div className="text-white/60 text-xs leading-relaxed">
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
