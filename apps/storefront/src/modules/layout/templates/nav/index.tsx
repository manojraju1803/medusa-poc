import { Suspense } from "react"

import { getActiveWarehouse } from "@lib/data/active-warehouse"
import { retrieveCustomer } from "@lib/data/customer"
import { ROLE_LABEL, roleOfCustomer } from "@lib/util/registration"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import HeaderSearch from "@modules/layout/components/header-search"
import {
  BagIcon,
  CompareIcon,
  HeartIcon,
} from "@modules/layout/components/ib-icons"
import MegaMenu from "@modules/layout/components/mega-menu"
import LogoutButton from "@modules/layout/components/logout-button"
import MobileMenu from "@modules/layout/components/mobile-menu"
import WarehouseSelect from "@modules/layout/components/warehouse-select"
import { AGRO_MENU, FOOD_MENU, NUTRA_MENU } from "@modules/layout/components/nav-links"
import { getNavMenus } from "@modules/layout/lib/menu-categories"
import { ActiveWarehouse } from "types/warehouse"

const ANNOUNCEMENTS = [
  "Verified ingredients from trusted brands, with COA & lab reports available",
  "Approved buyers get live inventory and slab pricing",
  "Same-day dispatch on orders paid before 2:00 PM",
  "Account verification and approval usually take 24–48 hours",
  "Bulk enquiries: +91 90350 22477 · sales@ingredientsbazar.com",
]

const AnnouncementBar = ({ warehouse }: { warehouse: ActiveWarehouse | null }) => (
  <div className="bg-[#0d3320] text-white border-b border-white/10 shrink-0 flex items-center">
    <div className="flex-1 min-w-0 overflow-hidden">
    {/* Messages are rendered twice so the -50% scroll loops seamlessly. */}
    <div className="announcement-track flex w-max items-center py-2">
      {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((msg, i) => (
        <div
          key={i}
          aria-hidden={i >= ANNOUNCEMENTS.length || undefined}
          className="flex items-center gap-3 px-8 text-[11px] font-medium whitespace-nowrap"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
          {msg}
        </div>
      ))}
    </div>
    </div>
    {/* The same warehouse the listing is narrowed to. */}
    <div className="shrink-0 px-4 sm:px-6 text-[11px] font-medium opacity-90">
      <WarehouseSelect
        warehouses={warehouse?.warehouses ?? []}
        selectedId={warehouse?.warehouse.id}
        hasChosen={warehouse?.chosen ?? false}
      />
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
    title={label}
    className="hidden md:flex flex-col items-center justify-center gap-0.5 min-w-[40px] h-10 px-2 text-gray-500 hover:text-[#4d7c0f] hover:bg-[#f6fbee] rounded-lg transition-all"
  >
    {children}
    <span className="hidden large:block text-[9px] leading-none">{label}</span>
  </LocalizedClientLink>
)

export default async function Nav() {
  const [menus, customer, warehouse] = await Promise.all([
    getNavMenus(NUTRA_MENU, FOOD_MENU, AGRO_MENU),
    retrieveCustomer().catch(() => null),
    getActiveWarehouse(),
  ])

  const displayName =
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
    customer?.company_name ||
    customer?.email
  const accountType = ROLE_LABEL[roleOfCustomer(customer?.metadata)]
  const initials = (displayName || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("")

  return (
    <div className="sticky top-0 inset-x-0 z-50 font-sans">
      <AnnouncementBar warehouse={warehouse} />
      <header className="relative bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 h-[60px] flex items-center gap-3">
          <LocalizedClientLink
            href="/"
            className="flex items-center shrink-0"
            data-testid="nav-store-link"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Ingredients Bazar" className="h-9 sm:h-10 w-auto object-contain" />
          </LocalizedClientLink>

          <MegaMenu nutra={menus.nutra} food={menus.food} agro={menus.agro} />

          <HeaderSearch className="flex-1 hidden md:flex min-w-[200px] max-w-[320px] ml-auto" />

          <div className="flex items-center gap-0.5 shrink-0 ml-auto md:ml-1">
            {customer && (
              <>
            <IconLink href="/account/wishlist" label="Wishlist" testId="nav-wishlist-link">
              <HeartIcon className="w-4 h-4" />
            </IconLink>
            <IconLink href="/compare" label="Compare" testId="nav-compare-link">
              <CompareIcon className="w-4 h-4" />
            </IconLink>
            <IconLink href="/account/orders" label="Orders" testId="nav-orders-link">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </IconLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex flex-col items-center justify-center gap-0.5 min-w-[40px] h-10 px-2 text-gray-500"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <BagIcon className="w-4 h-4" />
                  <span className="hidden large:block text-[9px] leading-none">Cart</span>
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
                  title={displayName}
                  className="flex items-center gap-2 h-10 px-2 hover:bg-[#f6fbee] rounded-lg transition-all ml-1"
                >
                  <span className="w-7 h-7 bg-[#4d7c0f] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    {initials}
                  </span>
                  <span className="hidden large:flex flex-col items-start max-w-[110px]">
                    <span className="text-xs font-semibold text-[#0f172a] leading-none truncate max-w-full">
                      {displayName}
                    </span>
                    <span className="text-[9px] text-[#4d7c0f] leading-none mt-0.5">
                      {accountType}
                    </span>
                  </span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </LocalizedClientLink>
                <div className="absolute top-full right-0 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 hidden group-hover:block">
                  <LocalizedClientLink href="/account/profile" className="block w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#f6fbee] hover:text-[#4d7c0f] transition-colors">My Profile</LocalizedClientLink>
                  <LocalizedClientLink href="/account/orders" className="block w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#f6fbee] hover:text-[#4d7c0f] transition-colors">My Orders</LocalizedClientLink>
                  <LocalizedClientLink href="/compare" className="block w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#f6fbee] hover:text-[#4d7c0f] transition-colors">Compare Ingredients</LocalizedClientLink>
                  <LocalizedClientLink href="/account/wishlist" className="block w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#f6fbee] hover:text-[#4d7c0f] transition-colors">Wishlist</LocalizedClientLink>
                  <LocalizedClientLink href="/contact" className="block w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-[#f6fbee] hover:text-[#4d7c0f] transition-colors">Request Quote</LocalizedClientLink>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <LogoutButton />
                  </div>
                </div>
              </div>
            ) : (
              <LocalizedClientLink
                href="/account"
                data-testid="nav-account-link"
                className="hidden sm:inline-flex items-center shrink-0 h-9 px-4 text-sm font-semibold bg-[#006b4f] text-white rounded-lg hover:bg-[#00563f] transition-colors whitespace-nowrap"
              >
                Get Started
              </LocalizedClientLink>
            )}

            <MobileMenu isLoggedIn={!!customer} />
          </div>
        </div>
      </header>
    </div>
  )
}
