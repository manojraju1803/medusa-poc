"use client"

import { ArrowRightOnRectangle } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useParams, usePathname } from "next/navigation"

import { signout } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  const initials = [customer?.first_name?.[0], customer?.last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "IB"

  const navItems = [
    {
      label: "Dashboard Overview",
      href: "/account",
      icon: "📊",
      testId: "overview-link",
    },
    {
      label: "Company & Profile",
      href: "/account/profile",
      icon: "🏢",
      testId: "profile-link",
    },
    {
      label: "Delivery Addresses",
      href: "/account/addresses",
      icon: "📍",
      testId: "addresses-link",
    },
    {
      label: "Orders & Invoices",
      href: "/account/orders",
      icon: "📦",
      testId: "orders-link",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile Account Navigation */}
      <div className="lg:hidden bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs" data-testid="mobile-account-nav">
        {route !== `/${countryCode}/account` ? (
          <LocalizedClientLink
            href="/account"
            className="flex items-center gap-x-2 text-xs font-semibold text-[#1C94D2] py-1"
            data-testid="account-main-link"
          >
            <ChevronDown className="transform rotate-90" />
            <span>← Return to Account Dashboard</span>
          </LocalizedClientLink>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-[#1C94D2] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-[#0f172a] truncate">
                  {customer?.first_name} {customer?.last_name}
                </span>
                <span className="text-xs text-[#64748b] truncate">
                  {customer?.email}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const active = route.split(countryCode)[1] === item.href
                return (
                  <LocalizedClientLink
                    key={item.href}
                    href={item.href}
                    className={clx(
                      "flex items-center gap-2 p-3 rounded-xl text-xs font-medium border transition-colors",
                      active
                        ? "bg-[#EBF6FC] text-[#0369A1] border-[#BAE6FD] font-bold"
                        : "bg-gray-50 text-[#334155] border-gray-200/60 hover:bg-gray-100"
                    )}
                    data-testid={item.testId}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </LocalizedClientLink>
                )
              })}
            </div>

            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors w-full"
              onClick={handleLogout}
              data-testid="logout-button"
            >
              <ArrowRightOnRectangle className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>

      {/* Desktop Account Sidebar Card */}
      <div className="hidden lg:flex flex-col bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs" data-testid="account-nav">
        {/* User Profile Header */}
        <div className="p-6 bg-gradient-to-br from-[#f8fafc] to-[#F0F9FF] border-b border-gray-100 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1C94D2] text-white flex items-center justify-center font-bold text-base shadow-sm ring-4 ring-[#BAE6FD]/60">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-[#0f172a] truncate">
                {customer?.first_name} {customer?.last_name}
              </span>
              <span className="text-xs text-[#64748b] truncate max-w-[160px]">
                {customer?.email}
              </span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-[#F4FBEA] border border-[#D4EDAB] text-[11px] font-bold text-[#15803D]">
            <span>✓ Verified B2B Buyer</span>
          </div>
        </div>

        {/* Nav Links */}
        <div className="p-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = route.split(countryCode)[1] === item.href
            return (
              <LocalizedClientLink
                key={item.href}
                href={item.href}
                className={clx(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all",
                  active
                    ? "bg-[#EBF6FC] text-[#0369A1] font-bold border-l-4 border-[#1C94D2] shadow-xs"
                    : "text-[#334155] hover:bg-gray-50 hover:text-[#0f172a]"
                )}
                data-testid={item.testId}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <ChevronDown className="transform -rotate-90 w-3.5 h-3.5 opacity-40" />
              </LocalizedClientLink>
            )
          })}

          <div className="pt-2 mt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              data-testid="logout-button"
            >
              <ArrowRightOnRectangle className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountNav
