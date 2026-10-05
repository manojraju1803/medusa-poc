import LocalizedClientLink from "@modules/common/components/localized-client-link"

const FEATURED_CATEGORIES = [
  {
    id: "extracts",
    name: "Botanical & Herbal Extracts",
    handle: "extracts",
    icon: "🌿",
    count: "23+ Products",
    suppliers: "100% Pure Phytochemicals",
    desc: "Standardized Curcumin 95%, Ashwagandha, Green Tea, Silymarin & Herbal Actives",
  },
  {
    id: "sweetner-and-polyol",
    name: "Natural Sweeteners & Polyols",
    handle: "sweetner-and-polyol",
    icon: "🍯",
    count: "27+ Products",
    suppliers: "Non-GMO Clean Label",
    desc: "Stevia Reb A 98%, Erythritol, Monk Fruit, Xylitol & Maltitol Solutions",
  },
  {
    id: "dairy-ingredients",
    name: "Dairy & Pure Milk Proteins",
    handle: "dairy-ingredients",
    icon: "🥛",
    count: "45+ Products",
    suppliers: "Global Dairy Sourcing",
    desc: "WPC 80, WPI 90, Micellar Casein, Skim Milk Powder, Sodium Caseinate",
  },
  {
    id: "amino-acids",
    name: "Plant & Amino Proteins",
    handle: "amino-acids",
    icon: "🧬",
    count: "20+ Products",
    suppliers: "FCC / USP Grade",
    desc: "Pea Protein, Soy Isolate, L-Glutamine, BCAAs & Plant-Derived Actives",
  },
  {
    id: "gums",
    name: "Natural Gums & Hydrocolloids",
    handle: "gums",
    icon: "🧪",
    count: "25+ Products",
    suppliers: "Clean Texture Agents",
    desc: "Non-GMO Xanthan Gum, Pure Guar Gum, Carrageenan, Gum Arabic & Citrus Pectin",
  },
  {
    id: "cocoa-powder",
    name: "Pure Cocoa & Chocolates",
    handle: "cocoa-powder",
    icon: "🍫",
    count: "12+ Products",
    suppliers: "Origin Guaranteed",
    desc: "Natural Cocoa 10-12%, Alkalized Dark, Raw Cocoa Butter & Nibs",
  },
  {
    id: "bakery",
    name: "Bakery & Dough Conditioners",
    handle: "bakery",
    icon: "🍞",
    count: "105+ Products",
    suppliers: "FSSAI Certified",
    desc: "Natural Enzymes, Sunflower Lecithin, Whey Powder & Natural Emulsifiers",
  },
  {
    id: "confectionery",
    name: "Confectionery & Flavoring",
    handle: "confectionery",
    icon: "🍬",
    count: "114+ Products",
    suppliers: "Industrial Grade",
    desc: "Natural Flavoring Extracts, Liquid Glucose, Texture Modifiers & Glazes",
  },
]

export default function CategoryGrid() {
  return (
    <section className="py-12 bg-[#F8FAFC] border-b border-gray-200">
      <div className="content-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#1C94D2] mb-1">
              <span>Live Industrial Sourcing</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#0f172a]">
              Browse by Ingredient Category
            </h2>
            <p className="text-sm text-[#6b7280] mt-1">
              Explore 370+ lab-certified raw ingredients across food, beverage, nutraceutical, and pharmaceutical manufacturing
            </p>
          </div>
          <LocalizedClientLink
            href="/store"
            className="text-xs font-semibold text-[#1C94D2] hover:text-[#0284c7] hover:underline flex items-center gap-1"
          >
            <span>View All Categories</span>
            <span>→</span>
          </LocalizedClientLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_CATEGORIES.map((cat) => (
            <LocalizedClientLink
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className="p-5 rounded-2xl bg-white border border-gray-200/90 hover:border-[#1C94D2] shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-out group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl p-2.5 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] group-hover:scale-115 group-hover:rotate-6 transition-all duration-300 inline-block">
                    {cat.icon}
                  </span>
                  <span className="text-[10px] font-bold text-[#0369A1] bg-[#EBF6FC] px-2.5 py-0.5 rounded-full border border-[#BAE6FD] transition-colors group-hover:bg-[#dbeafe]">
                    {cat.suppliers}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#0f172a] group-hover:text-[#1C94D2] transition-colors mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#6b7280] line-clamp-2 mb-3 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
              <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-[#6b7280]">
                <span className="font-semibold text-[#0f172a]">{cat.count}</span>
                <span className="text-[#1C94D2] font-semibold group-hover:translate-x-1.5 transition-transform duration-200 flex items-center gap-1">
                  <span>Explore</span>
                  <span>→</span>
                </span>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
