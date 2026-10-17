import { clx } from "@modules/common/components/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { PriceTier } from "types/global"

export default function ProductPrice({
  product,
  variant,
  isLoggedIn,
  tier,
  quantity,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  isLoggedIn?: boolean
  // The quantity slab the selected quantity falls in, if any
  tier?: PriceTier
  // Omitted while the quantity is below the minimum order, so no total shows
  quantity?: number
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return (
      <span className="text-ui-fg-subtle">
        {isLoggedIn
          ? "Your account is awaiting approval"
          : "Sign in to see pricing"}
      </span>
    )
  }

  if (tier) {
    const unitPrice = convertToLocale({
      amount: tier.unit_amount,
      currency_code: selectedPrice.currency_code,
    })

    return (
      <div className="flex flex-col text-ui-fg-base">
        <span className="text-xl-semi">
          <span data-testid="product-price" data-value={tier.unit_amount}>
            {unitPrice}
          </span>
          <span className="text-base-regular text-ui-fg-subtle"> / unit</span>
        </span>
        {quantity != null && (
          <span
            className="text-small-regular text-ui-fg-subtle"
            data-testid="product-price-total"
          >
            {quantity} × {unitPrice} ={" "}
            {convertToLocale({
              amount: tier.unit_amount * quantity,
              currency_code: selectedPrice.currency_code,
            })}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col text-ui-fg-base">
      <span
        className={clx("text-xl-semi", {
          "text-ui-fg-interactive": selectedPrice.price_type === "sale",
        })}
      >
        {!variant && "From "}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
      {selectedPrice.price_type === "sale" && (
        <>
          <p>
            <span className="text-ui-fg-subtle">Original: </span>
            <span
              className="line-through"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {selectedPrice.original_price}
            </span>
          </p>
          <span className="text-ui-fg-interactive">
            -{selectedPrice.percentage_diff}%
          </span>
        </>
      )}
    </div>
  )
}
