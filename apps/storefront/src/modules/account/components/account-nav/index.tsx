"use client"

import { clx } from "@modules/common/components/ui"
import { useParams, usePathname } from "next/navigation"

import { signout } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const LINKS = [
  { href: "/account", label: "Overview", testId: "overview-link", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/account/profile", label: "My Profile", testId: "profile-link", d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { href: "/account/orders", label: "My Orders", testId: "orders-link", d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { href: "/account/addresses", label: "Addresses", testId: "addresses-link", d: "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/account/wishlist", label: "Wishlist", testId: "wishlist-link", d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { href: "/compare", label: "Compare", testId: "compare-link", d: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" },
  { href: "/cart", label: "Cart", testId: "cart-link", d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
]

const AccountNav = ({
  customer,
  approved,
  accountType,
}: {
  customer: HttpTypes.StoreCustomer | null
  approved: boolean
  accountType: string
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }
  const current = route?.split(`/${countryCode}`)[1] || ""

  const handleLogout = async () => {
    await signout(countryCode)
  }

  const initials =
    `${customer?.first_name?.[0] || ""}${customer?.last_name?.[0] || ""}`.toUpperCase() ||
    "IB"

  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden small:sticky small:top-[72px]"
      data-testid="account-nav"
    >
      <div className="px-4 py-3 border-b border-gray-100 bg-[#fafdf5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4d7c0f] rounded-xl text-white text-sm font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#0f172a] truncate">
              Hello {customer?.first_name}
            </p>
            <p className="text-xs text-[#64748b] truncate">{customer?.email}</p>
          </div>
        </div>
        {customer?.company_name && (
          <p className="text-xs text-[#374151] mt-3 truncate">
            {customer.company_name}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          <span
            className={clx(
              "text-[11px] font-bold px-2 py-0.5 rounded-full border",
              approved
                ? "text-[#4d7c0f] bg-[#f6fbee] border-[#d9edb8]"
                : "text-amber-700 bg-amber-50 border-amber-200"
            )}
            data-testid="approval-status"
            data-value={approved ? "approved" : "pending"}
          >
            {approved ? "✓ Approved" : "Pending approval"}
          </span>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-gray-200 text-[#374151] bg-white"
            data-testid="account-type"
          >
            {accountType}
          </span>
        </div>
      </div>
      <ul className="py-2">
        {LINKS.map((link) => {
          const active = current === link.href
          return (
            <li key={link.href}>
              <LocalizedClientLink
                href={link.href}
                className={clx(
                  "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-[#4d7c0f] text-white"
                    : "text-[#374151] hover:bg-[#f6fbee] hover:text-[#4d7c0f]"
                )}
                data-testid={link.testId}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.d} />
                </svg>
                {link.label}
              </LocalizedClientLink>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            data-testid="logout-button"
          >
            Log out
          </button>
        </li>
      </ul>
    </div>
  )
}

export default AccountNav
