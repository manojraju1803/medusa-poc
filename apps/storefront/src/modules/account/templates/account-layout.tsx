import React, { Suspense } from "react"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import AccountNav from "../components/account-nav"
import ApprovalBanner from "../components/approval-banner"
import { accountTypeLabel, isCustomerApproved } from "../lib/approval"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout = async ({ customer, children }: AccountLayoutProps) => {
  // Logged out: the login / register screens use the full width.
  if (!customer) {
    return (
      <div className="flex-1 bg-[#f8fffe]" data-testid="account-page">
        {children}
      </div>
    )
  }

  const approved = await isCustomerApproved()

  return (
    <div className="flex-1 bg-[#f8fffe]" data-testid="account-page">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <Suspense fallback={null}>
          <ApprovalBanner approved={approved} />
        </Suspense>
        <div className="grid grid-cols-1 small:grid-cols-[220px_1fr] gap-5">
          <div>
            <AccountNav
              customer={customer}
              approved={approved}
              accountType={accountTypeLabel(customer)}
            />
          </div>
          <div className="flex-1 min-w-0 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            {children}
          </div>
        </div>
        <div className="mt-8 flex flex-col small:flex-row items-start small:items-center justify-between gap-4 bg-white border border-[#e2f3eb] rounded-2xl p-6">
          <div>
            <h3 className="text-base font-bold text-[#0f172a] mb-1">
              Got questions?
            </h3>
            <span className="text-sm text-[#64748b]">
              Our sourcing team is happy to help with orders, pricing and
              approvals.
            </span>
          </div>
          <LocalizedClientLink
            href="/contact"
            className="px-5 py-2.5 bg-[#006B4F] hover:bg-[#005a42] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Contact us
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
