"use client"

import { clx } from "@modules/common/components/ui"
import { useParams, usePathname } from "next/navigation"

import { signout } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const LINKS = [
  { href: "/account", label: "Overview", testId: "overview-link" },
  { href: "/account/profile", label: "Profile", testId: "profile-link" },
  { href: "/account/addresses", label: "Addresses", testId: "addresses-link" },
  { href: "/account/orders", label: "Orders", testId: "orders-link" },
  { href: "/account/wishlist", label: "Wishlist", testId: "wishlist-link" },
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
      className="bg-white border border-[#e2f3eb] rounded-2xl shadow-sm overflow-hidden"
      data-testid="account-nav"
    >
      <div className="p-5 border-b border-[#e2f3eb] bg-[#f7faf9]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#006B4F] text-white font-bold flex items-center justify-center shrink-0">
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
                ? "text-[#006B4F] bg-[#f0fdf4] border-[#bbf7d0]"
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
      <ul className="p-2">
        {LINKS.map((link) => {
          const active = current === link.href
          return (
            <li key={link.href}>
              <LocalizedClientLink
                href={link.href}
                className={clx(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors",
                  active
                    ? "bg-[#006B4F] text-white font-semibold"
                    : "text-[#374151] hover:bg-[#f0fdf4] hover:text-[#006B4F]"
                )}
                data-testid={link.testId}
              >
                {link.label}
                <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </LocalizedClientLink>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
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
