import { Suspense } from "react"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"
import { listCategories } from "@lib/data/categories"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import HeaderSearch from "@modules/layout/components/header-search"

export default async function Nav() {
  const [regions, locales, currentLocale, customer, categories] = await Promise.all([
    listRegions().then((regions: HttpTypes.StoreRegion[]) => regions).catch(() => []),
    listLocales().catch(() => []),
    getLocale().catch(() => "en"),
    retrieveCustomer().catch(() => null),
    listCategories({ limit: 100 }).catch(() => []),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      {/* Top B2B Announcement Bar */}
      <div className="bg-[#F0F9FF] text-[#0369A1] text-xs py-1.5 px-4 font-medium border-b border-[#BAE6FD]">
        <div className="content-container flex justify-between items-center">
          <div className="flex items-center gap-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#97C93E] animate-pulse" />
            <span className="hidden sm:inline text-[#071D33] font-bold">Next Generation Multi-Brand Ingredients Platform — </span>
            <span className="text-[#0369A1] font-medium">ISO 9001, GMP & Halal Certified Raw Ingredients</span>
          </div>
          <div className="hidden md:flex items-center gap-x-4 text-[#334155] text-[11px] font-medium">
            <span>📦 Flexible MOQ from 25 kg</span>
            <span>•</span>
            <span>🚚 Pan-India Cold Chain Freight</span>
            <span>•</span>
            <LocalizedClientLink href="/contact" className="hover:text-[#1C94D2] underline text-[#0284C7] font-semibold">
              B2B Support
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="relative bg-white border-b border-gray-200 shadow-xs duration-200">
        <nav className="content-container flex items-center justify-between w-full h-20 gap-x-4">
          {/* Brand Logo & Menu Button */}
          <div className="flex items-center gap-x-3 sm:gap-x-5 flex-shrink-0">
            {/* Official Logo (Crisp Sizing & Micro-Animation) */}
            <LocalizedClientLink
              href="/"
              className="flex items-center group py-1 relative focus:outline-none"
              data-testid="nav-store-link"
            >
              <div className="relative flex items-center">
                <img
                  src="/logo.png"
                  alt="IngredientsBazar - Next Generation Multi Brand Ingredients Platform"
                  className="h-11 sm:h-13 md:h-15 w-auto max-w-[210px] sm:max-w-[260px] md:max-w-[300px] object-contain transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:drop-shadow-[0_2px_10px_rgba(28,148,210,0.18)]"
                />
              </div>
            </LocalizedClientLink>

            {/* All Categories Drawer Button */}
            <div className="flex items-center">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
                categories={categories}
              />
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="hidden lg:flex items-center gap-x-6 text-sm font-medium text-[#374151]">
            <LocalizedClientLink
              href="/store"
              className="hover:text-[#1C94D2] transition-colors"
            >
              Product Catalog
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store"
              className="hover:text-[#1C94D2] transition-colors flex items-center gap-1.5 text-[#15803D] font-semibold"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-[#97C93E]" />
              Verified Suppliers
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/contact"
              className="hover:text-[#1C94D2] transition-colors text-[#4b5563]"
            >
              Bulk Inquiries & RFQ
            </LocalizedClientLink>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xs md:max-w-sm lg:max-w-md mx-2">
            <HeaderSearch />
          </div>

          {/* User Account & Cart */}
          <div className="flex items-center gap-x-4 h-full flex-shrink-0 justify-end">
            <div className="hidden sm:flex items-center h-full">
              {customer ? (
                <LocalizedClientLink
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4FBEA] border border-[#D4EDAB] text-xs font-semibold text-[#15803D] hover:bg-[#E8F6D3] transition-colors"
                  href="/account"
                  data-testid="nav-account-link"
                >
                  <span className="w-2 h-2 rounded-full bg-[#97C93E]" />
                  <span>{customer.first_name || "B2B Buyer"}</span>
                </LocalizedClientLink>
              ) : (
                <LocalizedClientLink
                  className="text-xs font-semibold text-[#374151] hover:text-[#1C94D2] px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  href="/account"
                  data-testid="nav-account-link"
                >
                  Sign In / Register
                </LocalizedClientLink>
              )}
            </div>

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1C94D2] hover:bg-[#0284c7] text-white text-xs font-semibold transition-colors shadow-sm"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <span>Cart</span>
                  <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">0</span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
