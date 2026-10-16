import { Suspense } from "react"

import { retrieveCustomer } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import HeaderSearch from "@modules/layout/components/header-search"
import {
  BagIcon,
  CompareIcon,
  GlobeIcon,
  HeartIcon,
  LeafIcon,
} from "@modules/layout/components/ib-icons"
import MegaMenu from "@modules/layout/components/mega-menu"
import MobileMenu from "@modules/layout/components/mobile-menu"
import { NAV_LINKS } from "@modules/layout/components/nav-links"
import { getMenuCategories } from "@modules/layout/lib/menu-categories"

const UtilityBar = () => (
  <div className="bg-[#0d3320] text-white text-xs py-2">
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <span className="flex items-center gap-1.5 opacity-80 whitespace-nowrap">
          <GlobeIcon className="w-3.5 h-3.5" />
          B2B Ingredient Sourcing
        </span>
        <span className="hidden md:inline opacity-30">|</span>
        <span className="hidden md:inline opacity-75">
          <span className="text-[#4ade80]">✓</span> Verified Suppliers
        </span>
        <span className="hidden md:inline opacity-30">|</span>
        <span className="hidden md:inline opacity-75">
          <span className="text-[#4ade80]">✓</span> Technical Documentation
        </span>
        <span className="hidden lg:inline opacity-30">|</span>
        <span className="hidden lg:inline opacity-75">
          <span className="text-[#4ade80]">✓</span> COA & Lab Reports Available
        </span>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <LocalizedClientLink
          href="/contact"
          className="hidden sm:inline opacity-75 hover:opacity-100 transition-opacity"
        >
          Contact Sales
        </LocalizedClientLink>
        <span className="hidden sm:inline opacity-30">|</span>
        <LocalizedClientLink
          href="/account"
          className="opacity-80 hover:opacity-100 transition-opacity font-medium"
        >
          Become a Supplier
        </LocalizedClientLink>
      </div>
    </div>
  </div>
)

const IconLink = ({
  href,
  label,
  children,
  testId,
}: {
  href: string
  label: string
  children: React.ReactNode
  testId?: string
}) => (
  <LocalizedClientLink
    href={href}
    data-testid={testId}
    aria-label={label}
    className="hidden md:flex flex-col items-center gap-0.5 px-2 py-1.5 text-gray-500 hover:text-[#006B4F] hover:bg-[#f0fdf4] rounded-lg transition-all"
  >
    {children}
    <span className="text-[10px] leading-none">{label}</span>
  </LocalizedClientLink>
)

export default async function Nav() {
  const [categories, customer] = await Promise.all([
    getMenuCategories(),
    retrieveCustomer().catch(() => null),
  ])

  const displayName =
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
    customer?.company_name ||
    customer?.email
  const initials = (displayName || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("")

  return (
    <div className="sticky top-0 inset-x-0 z-50 font-sans">
      <UtilityBar />
      <header className="relative bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 py-2.5 flex items-center gap-3">
          <LocalizedClientLink
            href="/"
            className="flex items-center gap-2 shrink-0"
            data-testid="nav-store-link"
          >
            <span className="w-9 h-9 rounded-xl bg-[#006B4F] text-white flex items-center justify-center">
              <LeafIcon className="w-5 h-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-base sm:text-lg font-extrabold text-[#0f172a] tracking-tight">
                Ingredients <span className="text-[#006B4F]">Bazar</span>
              </span>
              <span className="hidden sm:block text-[10px] text-[#64748b] mt-0.5">
                B2B ingredient marketplace
              </span>
            </span>
          </LocalizedClientLink>

          <nav className="hidden lg:flex items-center ml-2">
            <MegaMenu categories={categories} />
            {NAV_LINKS.map((link) =>
              link.label === "Deals" ? (
                <LocalizedClientLink
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  {link.label}
                </LocalizedClientLink>
              ) : (
                <LocalizedClientLink
                  key={link.label}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-[#374151] hover:text-[#006B4F] hover:bg-[#f0fdf4] rounded-lg transition-all"
                >
                  {link.label}
                </LocalizedClientLink>
              )
            )}
          </nav>

          <HeaderSearch className="flex-1 hidden md:flex max-w-[360px] ml-auto" />

          <div className="flex items-center gap-1 ml-auto md:ml-0">
            <IconLink href="/account/wishlist" label="Wishlist" testId="nav-wishlist-link">
              <HeartIcon className="w-5 h-5" />
            </IconLink>
            <IconLink href="/compare" label="Compare" testId="nav-compare-link">
              <CompareIcon className="w-5 h-5" />
            </IconLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-gray-500"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <BagIcon className="w-5 h-5" />
                  <span className="text-[10px] leading-none">Cart</span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>

            {customer ? (
              <LocalizedClientLink
                href="/account"
                data-testid="nav-account-link"
                className="hidden md:flex items-center gap-2 px-2.5 py-1.5 hover:bg-[#f0fdf4] rounded-lg transition-all ml-1"
              >
                <span className="w-8 h-8 bg-[#006B4F] rounded-full flex items-center justify-center text-white text-[11px] font-bold">
                  {initials}
                </span>
                <span className="hidden xl:flex flex-col items-start max-w-[140px]">
                  <span className="text-xs font-semibold text-[#0f172a] leading-none truncate max-w-full">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-[#006B4F] leading-none mt-1">
                    My Account
                  </span>
                </span>
              </LocalizedClientLink>
            ) : (
              <LocalizedClientLink
                href="/account"
                data-testid="nav-account-link"
                className="hidden md:inline-flex px-4 py-2 text-sm font-semibold bg-[#006B4F] text-white rounded-lg hover:bg-[#005a42] transition-colors whitespace-nowrap ml-1"
              >
                Sign Up / Login
              </LocalizedClientLink>
            )}

            <MobileMenu categories={categories} isLoggedIn={!!customer} />
          </div>
        </div>
      </header>
    </div>
  )
}
