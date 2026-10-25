import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ArrowRightIcon,
  BoxIcon,
  ChartIcon,
  DocIcon,
  TruckIcon,
} from "@modules/layout/components/ib-icons"
import HeroSlides from "./slides"

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

// Fills the screen below the sticky header (announcement bar + nav, ~94px),
// so the next section starts below the fold.
const Hero = () => {
  return (
    <section className="relative min-h-[520px] h-[calc(100svh-94px)] flex items-center overflow-hidden">
      <HeroSlides />
      <div className="relative max-w-[1440px] mx-auto px-6 w-full pt-16 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-[#c5e39a] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-[#7aba0c] rounded-full animate-pulse" />
            The Global B2B Ingredient Marketplace
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] mb-4">
            Source Premium
            <br />
            <span className="text-[#7aba0c]">Ingredients</span> from
            <br />
            Verified Suppliers
          </h1>
          <p className="text-[#d9edb8]/90 text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
            Bulk food and nutraceutical ingredients from trusted brands, with
            live inventory, slab pricing for approved buyers and full quality
            documentation.
          </p>
          <div className="flex flex-wrap gap-3">
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7aba0c] hover:bg-[#6aa30a] text-[#00254d] font-semibold text-sm rounded-lg transition-colors"
            >
              Browse Ingredients <ArrowRightIcon className="w-4 h-4" />
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
