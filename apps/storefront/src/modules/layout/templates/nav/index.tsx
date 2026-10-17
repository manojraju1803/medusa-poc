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
} from "@modules/layout/components/ib-icons"
import MegaMenu from "@modules/layout/components/mega-menu"
import MobileMenu from "@modules/layout/components/mobile-menu"
import { FOOD_MENU, NUTRA_MENU } from "@modules/layout/components/nav-links"
import { getNavMenus } from "@modules/layout/lib/menu-categories"

const UtilityBar = () => (
  <div className="bg-[#0d3320] text-white text-xs py-2 shrink-0">
    <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 opacity-80">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
          Global Ingredient Sourcing
        </span>
        <span className="opacity-30">|</span>
        <span className="hidden md:inline opacity-75"><span className="text-[#4ade80]">✓</span> Verified Suppliers</span>
        <span className="hidden md:inline opacity-30">|</span>
        <span className="hidden md:inline opacity-75"><span className="text-[#4ade80]">✓</span> Technical Documentation</span>
        <span className="hidden lg:inline opacity-30">|</span>
        <span className="hidden lg:inline opacity-75"><span className="text-[#4ade80]">✓</span> COA & Lab Reports Available</span>
      </div>
      <div className="flex items-center gap-4">
        <a href="mailto:sales@ingredientsbazar.com" className="hidden md:inline opacity-75 hover:opacity-100 transition-opacity">sales@ingredientsbazar.com</a>
        <span className="hidden md:inline opacity-30">|</span>
        <a href="tel:+919035022477" className="hidden md:inline opacity-75 hover:opacity-100">+91 90350 22477</a>
        <span className="opacity-30">|</span>
        <LocalizedClientLink href="/account" className="opacity-80 hover:opacity-100 transition-opacity font-medium">Become a Supplier</LocalizedClientLink>
        <span className="opacity-30">|</span>
        <div className="flex items-center gap-1 opacity-75">
          <GlobeIcon className="w-3.5 h-3.5" />
          EN ▾
        </div>
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
    <span className="text-[9px] leading-none">{label}</span>
  </LocalizedClientLink>
)

export default async function Nav() {
  const [menus, customer] = await Promise.all([
    getNavMenus(NUTRA_MENU, FOOD_MENU),
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
            className="flex items-center shrink-0"
            data-testid="nav-store-link"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Ingredients Bazar" className="h-10 w-auto object-contain" />
          </LocalizedClientLink>

          <MegaMenu nutra={menus.nutra} food={menus.food} />

          <HeaderSearch className="flex-1 hidden md:flex max-w-[320px] ml-auto" />

          <div className="flex items-center gap-1">
            {customer && (
              <>
            <IconLink href="/account/wishlist" label="Wishlist" testId="nav-wishlist-link">
              <HeartIcon className="w-5 h-5" />
            </IconLink>
            <IconLink href="/compare" label="Compare" testId="nav-compare-link">
              <CompareIcon className="w-5 h-5" />
            </IconLink>
            <IconLink href="/account/orders" label="Orders" testId="nav-orders-link">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
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
              </>
            )}

            {customer ? (
              <div className="relative hidden md:block group">
                <LocalizedClientLink
                  href="/account"
                  data-testid="nav-account-link"
                  className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-[#f0fdf4] rounded-lg transition-all ml-1"
                >
                  <span className="w-7 h-7 bg-[#006B4F] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    {initials}
                  </span>
                  <span className="hidden lg:flex flex-col items-start max-w-[140px]">
                    <span className="text-xs font-semibold text-[#0f172a] leading-none truncate max-w-full">
                      {displayName}
                    </span>
                    <span className="text-[9px] text-[#006B4F] leading-none mt-0.5">
                      Buyer
                    </span>
                  </span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </LocalizedClientLink>
                <div className="absolute top-full right-0 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 hidden group-hover:block">
                  <LocalizedClientLink href="/account/profile" className="block w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#f0fdf4] hover:text-[#006B4F] transition-colors">My Profile</LocalizedClientLink>
                  <LocalizedClientLink href="/account/orders" className="block w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#f0fdf4] hover:text-[#006B4F] transition-colors">My Orders</LocalizedClientLink>
                  <LocalizedClientLink href="/compare" className="block w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#f0fdf4] hover:text-[#006B4F] transition-colors">Compare Ingredients</LocalizedClientLink>
                  <LocalizedClientLink href="/account/wishlist" className="block w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#f0fdf4] hover:text-[#006B4F] transition-colors">Wishlist</LocalizedClientLink>
                  <LocalizedClientLink href="/contact" className="block w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#f0fdf4] hover:text-[#006B4F] transition-colors">Request Quote</LocalizedClientLink>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <LocalizedClientLink href="/account" className="block w-full text-left px-4 py-2 text-sm text-[#006B4F] hover:bg-[#f0fdf4] transition-colors">My Account</LocalizedClientLink>
                  </div>
                </div>
              </div>
            ) : (
              <LocalizedClientLink
                href="/account"
                data-testid="nav-account-link"
                className="inline-flex px-4 py-2 text-sm font-semibold bg-[#006B4F] text-white rounded-lg hover:bg-[#005a42] transition-colors whitespace-nowrap ml-1"
              >
                Sign Up / Login
              </LocalizedClientLink>
            )}

            <MobileMenu isLoggedIn={!!customer} />
          </div>
        </div>
      </header>
    </div>
  )
}
