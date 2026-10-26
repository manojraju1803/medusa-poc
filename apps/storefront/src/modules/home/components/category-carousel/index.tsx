import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRightIcon } from "@modules/layout/components/ib-icons"
import { CARD_CLASS, CardImage, type CategoryCard } from "../catalogue-sections"

const SHOWN = 5

const CategoryStrip = ({ categories }: { categories: CategoryCard[] }) => {
  if (!categories.length) return null

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0f172a] mb-1">Browse by Category</h2>
          <p className="text-sm text-[#64748b]">
            Explore our curated ingredient categories from verified global suppliers
          </p>
        </div>
        <LocalizedClientLink
          href="/store"
          className="shrink-0 flex items-center gap-1 text-sm font-semibold text-[#166534] hover:text-[#14532d] transition-colors"
        >
          View All <ChevronRightIcon className="w-4 h-4" />
        </LocalizedClientLink>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {categories.slice(0, SHOWN).map((cat) => (
          <LocalizedClientLink
            key={cat.id}
            href={`/categories/${cat.handle}`}
            className={CARD_CLASS}
          >
            <CardImage src={cat.image} alt={cat.name} />
            <div className="p-4 flex flex-col flex-1">
              <div className="text-base font-semibold text-[#0f172a] group-hover:text-[#166534] transition-colors leading-6 line-clamp-1">
                {cat.name}
              </div>
              <div className="mt-auto pt-1.5 flex items-end justify-between gap-2">
                <div className="flex flex-col text-xs leading-4 text-[#64748b]">
                  {cat.productCount > 0 && (
                    <span>
                      {cat.productCount} ingredient{cat.productCount === 1 ? "" : "s"}
                    </span>
                  )}
                  {cat.subCount > 0 && (
                    <span>
                      {cat.subCount} sub-categor{cat.subCount === 1 ? "y" : "ies"}
                    </span>
                  )}
                </div>
                <span className="w-6 h-6 shrink-0 rounded-md bg-[#f0fdf4] border border-[#dcfce7] group-hover:bg-[#166534] group-hover:border-[#166534] flex items-center justify-center transition-colors">
                  <ChevronRightIcon className="w-3.5 h-3.5 text-[#166534] group-hover:text-white transition-colors" />
                </span>
              </div>
            </div>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}

export default CategoryStrip
