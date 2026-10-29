"use client"

import GstTotals from "@modules/cart/components/gst-totals"
import PaymentTerm from "@modules/cart/components/payment-term"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const count = cart.items?.length ?? 0

  return (
    <div className="flex flex-col gap-4 xl:sticky xl:top-[88px]">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-[#f8fffe]">
          <h2 className="text-base font-bold text-[#0f172a]">Order Summary</h2>
          <p className="text-[11px] text-[#64748b] mt-0.5">
            {count} item{count !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="px-5 py-4 space-y-4">
          <GstTotals
            source={cart}
            shippingSelected={(cart.shipping_methods?.length ?? 0) > 0}
          />
          {!cart.shipping_address?.province && !cart.tax_total && (
            <p className="text-[11px] text-[#64748b] -mt-1">
              GST is split into CGST + SGST or IGST once you enter the delivery
              state at checkout.
            </p>
          )}
          <PaymentTerm cart={cart} />
          <LocalizedClientLink
            href={"/checkout?step=" + step}
            data-testid="checkout-button"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#166534] hover:bg-[#14532d] text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-[#166534]/20"
          >
            Proceed to Checkout
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </LocalizedClientLink>
          <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-3 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="text-[11px] font-bold text-[#166534]">
                Your transaction is secure
              </p>
              <p className="text-[10px] text-[#4b5563] leading-relaxed mt-0.5">
                Prices and GST are calculated by our servers for your account.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
        <DiscountCode cart={cart} />
      </div>
      <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-2xl p-4">
        <h3 className="text-sm font-bold text-[#0f172a] mb-1">Need help?</h3>
        <p className="text-[11px] text-[#4b5563] leading-relaxed mb-3">
          Our sourcing experts are available Mon–Sat 9AM–6PM IST and ready to
          assist with your order.
        </p>
        <LocalizedClientLink
          href="/contact"
          className="block w-full py-2 text-center border border-[#166534]/40 text-[#166534] text-xs font-bold rounded-xl hover:bg-white transition-colors"
        >
          Contact Support
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Summary
