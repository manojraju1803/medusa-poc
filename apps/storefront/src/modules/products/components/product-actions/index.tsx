"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { minQuantityOf } from "@lib/util/min-quantity"
import { findPriceTier } from "@lib/util/price-tiers"
import { HttpTypes } from "@medusajs/types"
import { Button, clx } from "@modules/common/components/ui"
import Divider from "@modules/common/components/divider"
import ErrorMessage from "@modules/checkout/components/error-message"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { VariantPriceTiers } from "types/global"
import PriceTierTable from "../price-tier-table"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  isLoggedIn?: boolean
  priceTiers?: VariantPriceTiers[]
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"],
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
  isLoggedIn,
  priceTiers,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // A single-variant product is preselected in the initial state, not only in
  // the effect below: effects don't run on the server, so otherwise the
  // server-rendered page would show the quantity-1 "From" price, no slab table
  // and no minimum until hydration.
  const [options, setOptions] = useState<Record<string, string | undefined>>(
    () =>
      product.variants?.length === 1
        ? optionsAsKeymap(product.variants[0].options) ?? {}
        : {}
  )
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(() =>
    product.variants?.length === 1 ? minQuantityOf(product.variants[0]) : 1
  )
  const countryCode = useParams().countryCode as string

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  const minQuantity = useMemo(
    () => minQuantityOf(selectedVariant),
    [selectedVariant]
  )

  useEffect(() => {
    setQuantity(minQuantity)
  }, [minQuantity])

  // Typing below the minimum is allowed (clamping mid-typing would turn "3" on
  // the way to "30" into 25), but ordering is blocked. The backend's
  // minimum-quantity hooks remain the real enforcement.
  const belowMinimum = quantity < minQuantity

  const variantTiers = useMemo(
    () => priceTiers?.find((v) => v.variant_id === selectedVariant?.id),
    [priceTiers, selectedVariant]
  )

  // Below the minimum, show the entry slab rather than no price at all.
  const activeTier = findPriceTier(
    variantTiers?.tiers,
    Math.max(quantity, minQuantity)
  )

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setError(null)
    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
    })
      .catch((err) => setError(err.message))
      .finally(() => setIsAdding(false))
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice
          product={product}
          variant={selectedVariant}
          isLoggedIn={isLoggedIn}
          tier={activeTier}
          quantity={belowMinimum ? undefined : quantity}
        />

        {variantTiers && variantTiers.tiers.length > 1 && (
          <PriceTierTable
            tiers={variantTiers.tiers}
            currencyCode={variantTiers.currency_code}
            activeFrom={activeTier?.from}
          />
        )}

        <div className="flex gap-x-2">
          <input
            type="number"
            min={minQuantity}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            disabled={!!disabled || isAdding}
            className="border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 rounded-rounded p-2 w-20 text-center"
            data-testid="product-quantity-input"
          />
          <Button
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              !isValidVariant ||
              belowMinimum
            }
            variant="primary"
            className="w-full h-10"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant
              ? "Select variant"
              : !inStock || !isValidVariant
                ? "Out of stock"
                : "Add to cart"}
          </Button>
        </div>
        {minQuantity > 1 && (
          <span
            className={clx("text-small-regular", {
              "text-ui-fg-error": belowMinimum,
              "text-ui-fg-subtle": !belowMinimum,
            })}
            data-testid="min-quantity-hint"
          >
            Minimum order: {minQuantity}
          </span>
        )}
        <ErrorMessage error={error} data-testid="add-to-cart-error-message" />
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          error={error}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
          activeTier={activeTier}
          addDisabled={belowMinimum}
        />
      </div>
    </>
  )
}
