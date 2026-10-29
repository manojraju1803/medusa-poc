import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import GstTotals from "@modules/cart/components/gst-totals"
import DiscountCode from "@modules/checkout/components/discount-code"
import { provinceName } from "@modules/checkout/components/province-select/states"
import { HttpTypes } from "@medusajs/types"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const province = cart.shipping_address?.province

  return (
    <div className="small:sticky small:top-6 self-start flex flex-col gap-4">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-[#f8fffe]">
          <h2 className="text-base font-bold text-[#0f172a]">Order Summary</h2>
          <p className="text-[11px] text-[#64748b] mt-0.5">
            {cart.items?.length ?? 0} item
            {(cart.items?.length ?? 0) !== 1 ? "s" : ""}
            {province ? ` · Delivering to ${provinceName(province)}` : ""}
          </p>
        </div>
        <div className="px-5 pt-2">
          <ItemsPreviewTemplate cart={cart} />
        </div>
        <div className="px-5 py-4 border-t border-gray-100">
          <GstTotals
            source={cart}
            shippingSelected={(cart.shipping_methods?.length ?? 0) > 0}
          />
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
        <DiscountCode cart={cart} />
      </div>
    </div>
  )
}

export default CheckoutSummary
