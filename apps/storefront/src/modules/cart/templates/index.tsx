import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { VariantPriceTiers } from "types/global"

const TRUST = [
  {
    label: "Secure checkout",
    d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  },
  {
    label: "GST invoice",
    d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    label: "Dedicated support",
    d: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
  },
]

const CartTemplate = ({
  cart,
  customer,
  priceTiers,
  approved,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  priceTiers: VariantPriceTiers[]
  approved: boolean
}) => {
  const pending = !!customer && !approved

  return (
    <div className="min-h-screen bg-[#fafdf5]" data-testid="cart-container">
      <section className="relative overflow-hidden bg-[#00356e]">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/home-hero.jpg"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#00356e]/95 via-[#00356e]/85 to-transparent" />
        </div>
        <div className="relative max-w-[1440px] mx-auto px-4 small:px-6 py-8">
          <div className="flex flex-col small:flex-row items-start small:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-1.5 mb-3 text-[11px] text-[#c5e39a]/70">
                <LocalizedClientLink href="/" className="hover:text-[#7aba0c]">
                  Home
                </LocalizedClientLink>
                <span>/</span>
                <span className="text-[#c5e39a]">My Cart</span>
              </div>
              <h1 className="text-3xl small:text-4xl font-extrabold text-white mb-1.5">
                My Cart
              </h1>
              <p className="text-sm text-[#c5e39a]/80 max-w-sm">
                Review your selected ingredients and proceed to checkout
              </p>
            </div>
            <div className="flex flex-wrap gap-4 small:gap-6">
              {TRUST.map((t) => (
                <div key={t.label} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#4d7c0f]/40 border border-[#7aba0c]/20 flex items-center justify-center text-[#7aba0c]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={t.d} />
                    </svg>
                  </div>
                  <span className="text-xs text-[#c5e39a] font-medium">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 small:px-6 py-7">
        {pending ? (
          <div className="py-24 text-center">
            <h2 className="text-xl font-semibold text-[#00356e] mb-2">
              Your account is awaiting approval
            </h2>
            <p className="text-sm text-[#00356e]/70">
              Cart unlocks once approved.
            </p>
          </div>
        ) : cart?.items?.length ? (
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1 min-w-0 flex flex-col gap-5">
              {!customer && <SignInPrompt />}
              <ItemsTemplate cart={cart} priceTiers={priceTiers} />
            </div>
            <div className="w-full xl:w-[340px] shrink-0">
              {cart.region && <Summary cart={cart} />}
            </div>
          </div>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </div>
  )
}

export default CartTemplate
