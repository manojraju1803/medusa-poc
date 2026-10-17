"use client"

import { useRef } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRightIcon } from "@modules/layout/components/ib-icons"
import type { CategoryCard } from "../catalogue-sections"

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

const CategoryStrip = ({ categories }: { categories: CategoryCard[] }) => {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * 280, behavior: "smooth" })

  if (!categories.length) return null

  return (
    <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0f172a] mb-1">Browse by Category</h2>
          <p className="text-sm text-[#64748b]">
            Explore our curated ingredient categories from verified suppliers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LocalizedClientLink
            href="/store"
            className="shrink-0 flex items-center gap-1 text-sm font-semibold text-[#006B4F] hover:text-[#005a42] transition-colors mr-2"
          >
            View All <ChevronRightIcon className="w-4 h-4" />
          </LocalizedClientLink>
          <button
            type="button"
            aria-label="Previous categories"
            onClick={() => scroll(-1)}
            className="hidden md:flex w-8 h-8 items-center justify-center border border-gray-200 rounded-lg hover:border-[#006B4F] hover:text-[#006B4F] transition-colors text-gray-400"
          >
            <ChevronRightIcon className="w-4 h-4 rotate-180" />
          </button>
          <button
            type="button"
            aria-label="Next categories"
            onClick={() => scroll(1)}
            className="hidden md:flex w-8 h-8 items-center justify-center border border-gray-200 rounded-lg hover:border-[#006B4F] hover:text-[#006B4F] transition-colors text-gray-400"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1 snap-x">
        {categories.map((cat) => (
          <LocalizedClientLink
            key={cat.id}
            href={`/categories/${cat.handle}`}
            className="group snap-start shrink-0 w-[170px] md:w-[200px] bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-[#006B4F]/30 hover:shadow-md transition-all"
          >
            <div className="h-[120px] bg-green-50 overflow-hidden">
              <Thumb src={cat.image} alt={cat.name} />
            </div>
            <div className="p-3">
              <div className="text-sm font-semibold text-[#0f172a] mb-1 group-hover:text-[#006B4F] transition-colors leading-snug line-clamp-1">
                {cat.name}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#64748b]">
                  {cat.productCount > 0 && (
                    <div>
                      {cat.productCount} product{cat.productCount === 1 ? "" : "s"}
                    </div>
                  )}
                  {cat.subCount > 0 && <div>{cat.subCount} sub-categories</div>}
                </div>
                <div className="w-6 h-6 bg-[#f0fdf4] border border-[#dcfce7] group-hover:bg-[#006B4F] group-hover:border-[#006B4F] rounded-md flex items-center justify-center transition-colors">
                  <ChevronRightIcon className="w-3.5 h-3.5 text-[#006B4F] group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}

export default CategoryStrip
