import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  if (!customer) {
    return (
      <div className="bg-[#f8fafc] min-h-screen py-8 sm:py-12" data-testid="account-page">
        <div className="content-container max-w-5xl mx-auto px-4 sm:px-6">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 sm:py-12" data-testid="account-page">
      <div className="content-container max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#64748b] mb-6">
          <LocalizedClientLink href="/" className="hover:text-[#1C94D2] transition-colors">
            Home
          </LocalizedClientLink>
          <span>/</span>
          <LocalizedClientLink href="/account" className="hover:text-[#1C94D2] transition-colors">
            B2B Account
          </LocalizedClientLink>
          <span>/</span>
          <span className="text-[#0f172a] font-medium">Dashboard</span>
        </nav>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Sidebar Nav */}
          <div><AccountNav customer={customer} /></div>

          {/* Main Account View Area */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
            {children}
          </div>
        </div>

        {/* B2B Dedicated Procurement Support Banner */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-[#1C94D2] flex items-center justify-center text-2xl shrink-0">
              💬
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0f172a]">
                  Dedicated B2B Procurement Desk
                </h3>
                <span className="text-[10px] font-bold text-[#15803D] bg-[#F4FBEA] border border-[#D4EDAB] px-2 py-0.5 rounded-full">
                  ● Live Support
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-1 max-w-xl">
                Need bulk custom quotes, commercial GST invoicing support, or COA technical documentation? Our industrial ingredient specialists are ready to help.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <a
              href="https://wa.me/919999999999?text=Hello%20IngredientsBazar%20Team%2C%20I%20need%20procurement%20assistance"
              target="_blank"
              rel="noreferrer"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>WhatsApp Us</span>
            </a>
            <LocalizedClientLink
              href="/contact"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] text-xs font-bold transition-colors"
            >
              Contact Support →
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
