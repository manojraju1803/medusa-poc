import { NOINDEX } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Metadata } from "next"
import ChevronDown from "@modules/common/icons/chevron-down"

export const metadata: Metadata = {
  robots: NOINDEX,
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-[#f8fffe] relative small:min-h-screen font-sans">
      <div className="h-16 bg-white border-b border-[#dcfce7]">
        <nav className="flex h-full items-center max-w-[1280px] mx-auto px-4 small:px-6 justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-sm font-semibold text-[#166534] flex items-center gap-x-2 flex-1 basis-0 hover:text-[#14532d]"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="hidden small:block">Back to cart</span>
            <span className="block small:hidden">Back</span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="text-lg font-extrabold tracking-tight text-[#166534]"
            data-testid="store-link"
          >
            Ingredients<span className="text-[#0f172a]">Bazar</span>
          </LocalizedClientLink>
          <div className="flex-1 basis-0 flex justify-end">
            <span className="hidden small:flex items-center gap-1.5 text-xs font-medium text-[#64748b]">
              <svg className="w-4 h-4 text-[#166534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure checkout
            </span>
          </div>
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
    </div>
  )
}
