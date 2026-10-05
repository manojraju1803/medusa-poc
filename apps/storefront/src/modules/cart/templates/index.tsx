import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="bg-[#fcfdfd] min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-gray-100 bg-[#f8fffe]">
        <div className="content-container py-3 text-xs text-[#6b7280] flex items-center gap-1.5 flex-wrap">
          <LocalizedClientLink href="/" className="hover:text-[#1C94D2]">
            Home
          </LocalizedClientLink>
          <span>/</span>
          <span className="text-[#0f172a] font-semibold">Wholesale Cart</span>
        </div>
      </div>

      <div className="content-container py-8" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Items Column (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-y-6 bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate cart={cart} />
            </div>

            {/* Right Summary Column (4 cols, Sticky) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col gap-y-6">
                {cart && cart.region && <Summary cart={cart} />}

                {/* B2B Trust Points */}
                <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5 text-xs text-[#374151]">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      ✓
                    </span>
                    <span>Direct Manufacturer Sourcing & CoA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      ✓
                    </span>
                    <span>GST Compliant Invoicing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      ✓
                    </span>
                    <span>Real-time WhatsApp tracking</span>
                  </div>
                </div>
              </div>
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
