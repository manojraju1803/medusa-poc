import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()
  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="bg-[#fcfdfd] min-h-screen py-10">
      <div className="content-container max-w-4xl mx-auto flex flex-col gap-y-8">
        {isOnboarding && <OnboardingCta orderId={order.id} />}

        {/* Confirmation Hero Card */}
        <div
          className="bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm flex flex-col items-center text-center"
          data-testid="order-complete-container"
        >
          <div className="w-16 h-16 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center text-2xl font-bold mb-4 shadow-xs">
            ✓
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1 rounded-full mb-3">
            B2B Commercial Order Confirmed
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight mb-2">
            Thank You for Your Order!
          </h1>
          <p className="text-sm text-[#64748b] max-w-lg mb-6 leading-relaxed">
            Your commercial purchase order has been received by IngredientsBazar operations. Batch Certificate of Analysis (CoA) will be attached upon warehouse dispatch.
          </p>

          {/* WhatsApp Live Tracking Notification Banner */}
          <div className="w-full p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center gap-3 text-left">
            <span className="text-2xl">📱</span>
            <div>
              <p className="text-xs font-bold text-[#166534]">
                Live WhatsApp Updates Enabled
              </p>
              <p className="text-xs text-[#166534]/90">
                You will receive real-time notifications on WhatsApp for Packing, Shipment tracking, and Pan-India Delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <OrderDetails order={order} showStatus />

          <div className="pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-[#0f172a] mb-4">
              Ordered Line Items
            </h2>
            <Items order={order} />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <CartTotals totals={order} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <ShippingDetails order={order} />
            <PaymentDetails order={order} />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Help />
          </div>

          <div className="flex justify-center pt-4">
            <LocalizedClientLink
              href="/store"
              className="px-6 py-3 rounded-xl bg-[#1C94D2] hover:bg-[#0284c7] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <span>Continue Sourcing Catalog</span>
              <span>→</span>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}
