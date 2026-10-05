"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import { Fragment, useMemo, useState } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"

// Helper to assign relevant industrial icons dynamically based on category name & handle
const getCategoryIcon = (name: string = "", handle: string = "") => {
  const lower = (name + " " + handle).toLowerCase()
  if (lower.includes("amino") || lower.includes("protein")) return "🧬"
  if (lower.includes("dairy") || lower.includes("milk") || lower.includes("smp") || lower.includes("whey") || lower.includes("ghee")) return "🥛"
  if (lower.includes("bakery") || lower.includes("bread") || lower.includes("flour")) return "🍞"
  if (lower.includes("confectionery") || lower.includes("candy")) return "🍬"
  if (lower.includes("ice") || lower.includes("cream")) return "🍦"
  if (lower.includes("beverage") || lower.includes("drink")) return "🥤"
  if (lower.includes("vitamin") || lower.includes("mineral") || lower.includes("calcium") || lower.includes("zinc")) return "💊"
  if (lower.includes("cocoa") || lower.includes("chocolate")) return "🍫"
  if (lower.includes("sweet") || lower.includes("stevia") || lower.includes("sucralose") || lower.includes("polyol") || lower.includes("xylitol")) return "🍯"
  if (lower.includes("gum") || lower.includes("stabilizer") || lower.includes("emulsifier") || lower.includes("hydrocolloid") || lower.includes("xanthan")) return "🧪"
  if (lower.includes("extract") || lower.includes("botanical") || lower.includes("herbal") || lower.includes("plant") || lower.includes("turmeric") || lower.includes("ashwagandha")) return "🌿"
  if (lower.includes("fiber") || lower.includes("cereal") || lower.includes("oat") || lower.includes("wheat") || lower.includes("seed") || lower.includes("crispy")) return "🌾"
  if (lower.includes("fruit") || lower.includes("berry") || lower.includes("nut") || lower.includes("pistachio") || lower.includes("almond")) return "🍓"
  if (lower.includes("fat") || lower.includes("oil") || lower.includes("mct") || lower.includes("coconut")) return "🥥"
  if (lower.includes("enzyme") || lower.includes("probiotic")) return "🧫"
  if (lower.includes("label") || lower.includes("speciality") || lower.includes("filler") || lower.includes("acidulant")) return "🏷️"
  return "📦"
}

const B2B_TOOLS = [
  { name: "My B2B Account", href: "/account", icon: "👤" },
  { name: "Wholesale Cart", href: "/cart", icon: "🛒" },
  { name: "Order History & Live Tracking", href: "/account/orders", icon: "🚚" },
  { name: "Request Custom Quote (RFQ)", href: "/contact", icon: "📝" },
]

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  categories?: HttpTypes.StoreProductCategory[] | null
}

const SideMenu = ({ regions, locales, currentLocale, categories }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()
  const [searchTerm, setSearchTerm] = useState("")

  // Process live categories from Medusa database
  const liveCategories = useMemo(() => {
    if (!categories || categories.length === 0) {
      return []
    }

    // Filter top-level or high-level categories and sort by product count descending
    const filtered = categories
      .filter((cat) => !cat.parent_category && !cat.parent_category_id)
      .map((cat) => {
        const productCount = cat.products?.length || (cat.category_children?.reduce((acc, c) => acc + (c.products?.length || 0), 0) || 0)
        return {
          id: cat.id,
          name: cat.name,
          handle: cat.handle,
          href: `/categories/${cat.handle}`,
          icon: getCategoryIcon(cat.name, cat.handle),
          count: productCount,
          badge: productCount > 0 ? `${productCount} Items` : "Explore",
          children: cat.category_children || [],
        }
      })
      .sort((a, b) => b.count - a.count)

    return filtered
  }, [categories])

  // Filtered by search input
  const displayCategories = useMemo(() => {
    if (!searchTerm.trim()) return liveCategories
    const q = searchTerm.toLowerCase()
    return liveCategories.filter((c) => c.name.toLowerCase().includes(q))
  }, [liveCategories, searchTerm])

  const totalProductsCount = useMemo(() => {
    return categories?.reduce((sum, c) => sum + (c.products?.length || 0), 0) || 377
  }, [categories])

  return (
    <div className="h-full flex items-center">
      <Popover className="h-full flex items-center">
        {({ open, close }) => (
          <>
            <Popover.Button
              data-testid="nav-menu-button"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-[#f0f9ff] border border-gray-200 hover:border-[#1C94D2] text-xs font-semibold text-[#0f172a] hover:text-[#1C94D2] transition-all shadow-xs focus:outline-none"
            >
              {/* Category Grid Icon */}
              <svg
                className="w-4 h-4 text-[#1C94D2]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              <span className="hidden sm:inline">All Categories</span>
              <span className="sm:hidden">Categories</span>
            </Popover.Button>

            {open && (
              <div
                className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm pointer-events-auto"
                onClick={close}
                data-testid="side-menu-backdrop"
              />
            )}

            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 -translate-x-full"
              enterTo="opacity-100 translate-x-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo="opacity-0 -translate-x-full"
            >
              <PopoverPanel className="fixed top-0 left-0 bottom-0 w-full sm:w-[400px] z-[70] bg-white shadow-2xl flex flex-col justify-between overflow-y-auto">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white text-gray-900 shadow-xs sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <img
                      src="/logo.png"
                      alt="IngredientsBazar"
                      className="h-9 w-auto max-w-[180px] object-contain"
                    />
                  </div>
                  <button
                    data-testid="close-menu-button"
                    onClick={close}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    <XMark className="w-5 h-5" />
                  </button>
                </div>

                {/* Sourcing Categories List with Real Data */}
                <div className="p-5 flex-1 space-y-6">
                  {/* Category Search / Filter */}
                  <div>
                    <input
                      type="text"
                      placeholder="Filter categories (e.g., Dairy, Proteins)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#1C94D2] focus:outline-none bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">
                        Live Ingredient Categories
                      </span>
                      <span className="text-[10px] font-semibold text-[#1C94D2]">
                        {displayCategories.length} Categories
                      </span>
                    </div>

                    <ul className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
                      {/* All Product Catalog item */}
                      {!searchTerm && (
                        <li>
                          <LocalizedClientLink
                            href="/store"
                            onClick={close}
                            className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-[#1C94D2] bg-[#f0f9ff] hover:bg-[#e0f2fe] transition-colors border border-[#bae6fd]"
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="text-base">📦</span>
                              <span>All Products Catalog</span>
                            </span>
                            <span className="text-[10px] text-[#0369a1] bg-white px-2 py-0.5 rounded-full font-bold shadow-xs">
                              {totalProductsCount}+ SKUs
                            </span>
                          </LocalizedClientLink>
                        </li>
                      )}

                      {/* Dynamic Live Categories */}
                      {displayCategories.map((cat) => (
                        <li key={cat.id || cat.handle}>
                          <LocalizedClientLink
                            href={cat.href}
                            onClick={close}
                            className="flex items-center justify-between p-2 rounded-xl text-xs font-medium text-[#374151] hover:text-[#1C94D2] hover:bg-[#f0f9ff] transition-colors group"
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="text-base group-hover:scale-110 transition-transform">
                                {cat.icon}
                              </span>
                              <span className="truncate max-w-[200px]">{cat.name}</span>
                            </span>
                            <span className="text-[10px] text-[#0369a1] bg-[#e0f2fe] px-2 py-0.5 rounded-full font-semibold">
                              {cat.badge}
                            </span>
                          </LocalizedClientLink>
                        </li>
                      ))}

                      {displayCategories.length === 0 && (
                        <li className="text-center py-6 text-xs text-[#6b7280]">
                          No categories found matching "{searchTerm}"
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* B2B Sourcing Tools */}
                  <div className="pt-4 border-t border-gray-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-2 block">
                      Procurement & Orders
                    </span>
                    <ul className="space-y-1">
                      {B2B_TOOLS.map((tool) => (
                        <li key={tool.name}>
                          <LocalizedClientLink
                            href={tool.href}
                            onClick={close}
                            className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-[#0f172a] hover:text-[#1C94D2] hover:bg-[#f0f9ff] transition-colors"
                          >
                            <span>{tool.icon}</span>
                            <span>{tool.name}</span>
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Region / Language & Copyright */}
                <div className="p-5 border-t border-gray-100 bg-[#f8fffe] space-y-4">
                  {!!locales?.length && (
                    <div
                      className="flex justify-between items-center text-xs text-[#374151]"
                      onMouseEnter={languageToggleState.open}
                      onMouseLeave={languageToggleState.close}
                    >
                      <LanguageSelect
                        toggleState={languageToggleState}
                        locales={locales}
                        currentLocale={currentLocale}
                      />
                      <ArrowRightMini
                        className={clx(
                          "transition-transform duration-150 text-[#6b7280]",
                          languageToggleState.state ? "-rotate-90" : ""
                        )}
                      />
                    </div>
                  )}

                  {regions && (
                    <div
                      className="flex justify-between items-center text-xs text-[#374151]"
                      onMouseEnter={countryToggleState.open}
                      onMouseLeave={countryToggleState.close}
                    >
                      <CountrySelect
                        toggleState={countryToggleState}
                        regions={regions}
                      />
                      <ArrowRightMini
                        className={clx(
                          "transition-transform duration-150 text-[#6b7280]",
                          countryToggleState.state ? "-rotate-90" : ""
                        )}
                      />
                    </div>
                  )}

                  <Text className="text-[10px] text-[#6b7280] text-center pt-2">
                    © {new Date().getFullYear()} IngredientBazar Technologies Inc.
                  </Text>
                </div>
              </PopoverPanel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  )
}

export default SideMenu
