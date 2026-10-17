"use client"

import { Table, Text, clx } from "@modules/common/components/ui"
import { updateLineItem } from "@lib/data/cart"
import { minQuantityOf } from "@lib/util/min-quantity"
import { convertToLocale } from "@lib/util/money"
import { getNextTierNudge } from "@lib/util/price-tiers"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { FocusEvent, useState } from "react"
import { VariantPriceTiers } from "types/global"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
  // The slabs of this line's variant. Only the cart page passes them.
  priceTiers?: VariantPriceTiers
}

const Item = ({ item, type = "full", currencyCode, priceTiers }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    const saved = await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .then(() => true)
      .catch((err) => {
        setError(err.message)
        return false
      })

    setUpdating(false)
    return saved
  }

  const minQuantity = minQuantityOf(item.variant)

  // Saves when the input loses focus (Enter blurs it), so typing "50" sends one
  // request rather than one per keystroke.
  const saveQuantity = async (event: FocusEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const quantity = Number(input.value)

    if (quantity === item.quantity) {
      return
    }

    // Not a whole number, or rejected by the backend (below the minimum order
    // quantity, for one): show the saved quantity again. The backend's message
    // is shown under the input.
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      !(await changeQuantity(quantity))
    ) {
      input.value = String(item.quantity)
    }
  }

  // Computed from the saved quantity and the price the line is actually
  // charged, so it only changes once a new quantity is saved.
  const nudge =
    type === "full"
      ? getNextTierNudge({
          tiers: priceTiers?.tiers,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          minQuantity,
        })
      : undefined

  const formatAmount = (amount: number) =>
    convertToLocale({ amount, currency_code: currencyCode })

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
        {nudge && (
          <Text
            className="text-small-regular text-ui-fg-interactive mt-1"
            data-testid="cart-slab-nudge"
          >
            {`Add ${nudge.addQuantity} more to get ${formatAmount(
              nudge.unitSaving
            )} less per unit (save ${formatAmount(
              nudge.totalSaving
            )} on this item).`}
          </Text>
        )}
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center w-28">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
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
              className="border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 rounded-rounded p-2 w-16 text-center"
              data-testid="product-quantity-input"
            />
            {updating && <Spinner />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
