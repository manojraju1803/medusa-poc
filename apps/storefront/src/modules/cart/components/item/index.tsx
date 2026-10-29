"use client"

import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { minQuantityOf } from "@lib/util/min-quantity"
import { convertToLocale } from "@lib/util/money"
import { getNextTierNudge } from "@lib/util/price-tiers"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { FocusEvent, useState } from "react"
import { VariantPriceTiers } from "types/global"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  currencyCode: string
  // The slabs of this line's variant. Only the cart page passes them.
  priceTiers?: VariantPriceTiers
}

const Item = ({ item, currencyCode, priceTiers }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const minQuantity = minQuantityOf(item.variant)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    const saved = await updateLineItem({ lineId: item.id, quantity })
      .then(() => true)
      .catch((err) => {
        setError(err.message)
        return false
      })

    setUpdating(false)
    return saved
  }

  // Saves when the input loses focus (Enter blurs it), so typing "50" sends one
  // request rather than one per keystroke. The backend's minimum-quantity
  // hooks have the final say; their message is shown under the line.
  const saveQuantity = async (event: FocusEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const quantity = Number(input.value)

    if (quantity === item.quantity) {
      return
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      !(await changeQuantity(quantity))
    ) {
      input.value = String(item.quantity)
    }
  }

  const step = async (delta: number) => {
    const next = item.quantity + delta
    if (next < Math.max(1, minQuantity)) {
      setError(`Minimum order quantity is ${minQuantity}.`)
      return
    }
    await changeQuantity(next)
  }

  const remove = async () => {
    setRemoving(true)
    await deleteLineItem(item.id).catch((err) => {
      setError(err.message)
      setRemoving(false)
    })
  }

  // Computed from the saved quantity and the price the line is actually
  // charged, so it only changes once a new quantity is saved.
  const nudge = getNextTierNudge({
    tiers: priceTiers?.tiers,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    minQuantity,
  })

  const fmt = (amount: number) =>
    convertToLocale({ amount, currency_code: currencyCode })

  const unit = "unit"
  const brand = item.product_collection

  return (
    <div
      className="px-5 py-4 hover:bg-[#f8fffe] transition-colors group"
      data-testid="product-row"
    >
      <div className="flex items-start gap-4">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="w-[72px] small:w-[90px] shrink-0 rounded-xl overflow-hidden border border-gray-100"
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <LocalizedClientLink href={`/products/${item.product_handle}`}>
                <h3
                  className="font-bold text-[#0f172a] text-sm leading-snug hover:text-[#166534]"
                  data-testid="product-title"
                >
                  {item.product_title}
                </h3>
              </LocalizedClientLink>
              {brand && (
                <p className="text-xs text-[#64748b] mt-0.5">{brand}</p>
              )}
              {item.variant_sku && (
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-[#f0fdf4] border border-[#dcfce7] text-[#166534] rounded-full">
                  {item.variant_sku}
                </span>
              )}
            </div>
            <button
              onClick={remove}
              disabled={removing}
              aria-label="Remove item"
              className="shrink-0 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              data-testid="product-delete-button"
            >
              {removing ? (
                <Spinner />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
            <div
              className="flex items-center gap-1.5 text-[#4b5563]"
              data-testid="cart-item-moq"
            >
              <svg className="w-3 h-3 text-[#166534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-[11px] font-medium">
                Min. order qty: {minQuantity}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between mt-3 gap-3">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={updating || item.quantity <= minQuantity}
                className="w-8 h-8 bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#dcfce7] rounded-l-lg flex items-center justify-center text-[#166534] font-bold disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                // A new saved quantity remounts the input with it as the value.
                key={item.quantity}
                type="number"
                inputMode="numeric"
                min={minQuantity}
                step={1}
                defaultValue={item.quantity}
                onBlur={saveQuantity}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur()
                  }
                }}
                disabled={updating}
                aria-label="Quantity"
                className="w-14 h-8 bg-white border-t border-b border-[#dcfce7] text-center text-sm font-bold text-[#0f172a] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                data-testid="product-quantity-input"
              />
              <button
                type="button"
                onClick={() => step(1)}
                disabled={updating}
                className="w-8 h-8 bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#dcfce7] rounded-r-lg flex items-center justify-center text-[#166534] font-bold disabled:opacity-40"
                aria-label="Increase quantity"
              >
                +
              </button>
              {updating && (
                <span className="ml-2">
                  <Spinner />
                </span>
              )}
            </div>

            <div className="text-right">
              <div className="text-xs text-[#9ca3af]" data-testid="product-unit-price">
                {fmt(item.unit_price)} / {unit}
              </div>
              <div
                className="text-base font-extrabold text-[#166534]"
                data-testid="product-price"
              >
                {fmt(item.subtotal ?? item.unit_price * item.quantity)}
              </div>
            </div>
          </div>

          {nudge && (
            <p
              className="mt-2 text-[11px] font-medium text-[#0757a8]"
              data-testid="cart-slab-nudge"
            >
              {`Add ${nudge.addQuantity} more to pay ${fmt(
                nudge.unitSaving
              )} less per ${unit} (save ${fmt(nudge.totalSaving)} on this item).`}
            </p>
          )}
          <ErrorMessage error={error} data-testid="product-error-message" />
        </div>
      </div>
    </div>
  )
}

export default Item
