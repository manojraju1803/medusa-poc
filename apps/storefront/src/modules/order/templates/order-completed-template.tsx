import { cookies as nextCookies } from "next/headers"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderView from "@modules/order/components/order-view"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
  metadata?: Record<string, unknown> | null
}

export default async function OrderCompletedTemplate({
  order,
  metadata,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fafdf5]">
      <section className="bg-[#00356e]">
        <div className="max-w-[1280px] mx-auto px-4 small:px-6 py-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#4d7c0f] flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl small:text-3xl font-extrabold text-white">
              Thank you! Your order is placed.
            </h1>
            <p className="text-sm text-[#c5e39a]/80 mt-1">
              Order #{order.display_id} · we&apos;ll confirm dispatch by email.
            </p>
          </div>
        </div>
      </section>
      <div
        className="max-w-[1280px] mx-auto px-4 small:px-6 py-7 flex flex-col gap-5"
        data-testid="order-complete-container"
      >
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <OrderView order={order} metadata={metadata} />
        <div className="flex flex-wrap gap-3">
          <LocalizedClientLink
            href="/account/orders"
            className="px-5 py-2.5 bg-[#4d7c0f] hover:bg-[#3f6212] text-white font-semibold text-sm rounded-xl transition-colors"
          >
            View my orders
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/store"
            className="px-5 py-2.5 border border-[#4d7c0f]/40 text-[#4d7c0f] font-semibold text-sm rounded-xl hover:bg-[#f6fbee] transition-colors"
          >
            Continue shopping
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
