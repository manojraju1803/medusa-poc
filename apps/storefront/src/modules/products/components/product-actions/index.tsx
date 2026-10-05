"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { getVariantInventoryQuantity, isProductInStock } from "@lib/util/product"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import Divider from "@modules/common/components/divider"
import ErrorMessage from "@modules/checkout/components/error-message"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  isLoggedIn?: boolean
  isApproved?: boolean
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
  isApproved: isApprovedProp,
}: ProductActionsProps) {
  const isApproved =
    isApprovedProp ??
    !!product.variants?.some((v) => !!v.calculated_price)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initialVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return undefined
    }
    const vId = searchParams.get("v_id")
    return (vId && product.variants.find((v) => v.id === vId)) || product.variants[0]
  }, [product.variants, searchParams])

  const initialOptions = useMemo(() => {
    return initialVariant ? optionsAsKeymap(initialVariant.options) ?? {} : {}
  }, [initialVariant])

  const initialMinQuantity = useMemo(() => {
    const min = Number(initialVariant?.metadata?.min_quantity)
    return Number.isFinite(min) && min > 0 ? min : 1
  }, [initialVariant])

  const [options, setOptions] = useState<Record<string, string | undefined>>(initialOptions)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(initialMinQuantity)
  const countryCode = useParams().countryCode as string

  // Synchronize options if searchParams change
  useEffect(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    const vId = searchParams.get("v_id")
    const targetVariant =
      (vId && product.variants.find((v) => v.id === vId)) ||
      product.variants[0]

    if (targetVariant) {
      const variantOptions = optionsAsKeymap(targetVariant.options)
      setOptions((prev) => {
        const next = variantOptions ?? {}
        return isEqual(prev, next) ? prev : next
      })
    }
  }, [product.variants, searchParams])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return undefined
    }

    // Try finding variant by matching options
    if (Object.keys(options).length > 0) {
      const match = product.variants.find((v) => {
        const variantOptions = optionsAsKeymap(v.options)
        return isEqual(variantOptions, options)
      })
      if (match) return match
    }

    // Try finding by URL search param v_id
    const vId = searchParams.get("v_id")
    if (vId) {
      const match = product.variants.find((v) => v.id === vId)
      if (match) return match
    }

    // Default fallback to first variant
    return product.variants[0]
  }, [product.variants, options, searchParams])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  // check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return !!selectedVariant
  }, [selectedVariant])

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

  const minQuantity = useMemo(() => {
    const min = Number(selectedVariant?.metadata?.min_quantity)
    return Number.isFinite(min) && min > 0 ? min : 1
  }, [selectedVariant])

  useEffect(() => {
    setQuantity((prev) => (prev < minQuantity ? minQuantity : prev))
  }, [minQuantity])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    return isProductInStock(product, selectedVariant)
  }, [product, selectedVariant])

  const variantStockCount = useMemo(() => {
    return getVariantInventoryQuantity(selectedVariant) ?? 0
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    if (quantity < minQuantity) {
      setError(`Minimum order quantity for this item is ${minQuantity}`)
      return null
    }

    setError(null)
    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
    })
      .then(() => {
        router.push(`/${countryCode}/cart`)
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsAdding(false))
  }

  return (
    <>
      <div className="flex flex-col gap-y-4" ref={actionsRef}>
        {/* Variant options if multiple */}
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

        {/* Price display */}
        <div className="bg-[#f8fffe] p-4 rounded-xl border border-[#bbf7d0]/60 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-[#166534] uppercase tracking-wider">
            Industrial Wholesale Price
          </span>
          <ProductPrice
            product={product}
            variant={selectedVariant}
            isLoggedIn={isLoggedIn}
          />
        </div>

        {/* Variant Stock & MOQ indicator */}
        <div className="flex items-center justify-between text-xs py-1">
          {inStock ? (
            <span className="text-[#15803D] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#97C93E] animate-pulse" />
              {selectedVariant?.manage_inventory && variantStockCount > 0
                ? `${variantStockCount} units available in warehouse`
                : "In Stock (Bulk supply ready)"}
            </span>
          ) : (
            <span className="text-[#dc2626] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
              Currently out of stock
            </span>
          )}

          {minQuantity > 1 && (
            <span className="text-[#0369a1] font-medium bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-md">
              MOQ: {minQuantity} Units
            </span>
          )}
        </div>

        {/* Action Buttons / Sign in */}
        {!isLoggedIn ? (
          <div className="flex flex-col gap-y-2.5 pt-1">
            <LocalizedClientLink href="/account">
              <Button
                variant="secondary"
                className="w-full h-11 border-[#1C94D2] text-[#1C94D2] hover:bg-[#1C94D2] hover:text-white font-semibold transition-all shadow-xs"
              >
                Sign in to View B2B Pricing & Order
              </Button>
            </LocalizedClientLink>
            <span className="text-[11px] text-[#6b7280] text-center">
              Verified GST / Business accounts receive instant access to catalog pricing.
            </span>
          </div>
        ) : !isApproved ? (
          <div className="flex flex-col gap-y-2 pt-1">
            <Button disabled variant="secondary" className="w-full h-11 opacity-60">
              Account Pending Verification
            </Button>
            <span className="text-xs text-[#6b7280] text-center">
              Your business account is pending quick verification by our procurement team.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-x-3 pt-1">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden h-11 w-32 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(minQuantity, q - minQuantity))}
                disabled={quantity <= minQuantity || !!disabled || isAdding}
                className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent font-bold text-base"
              >
                -
              </button>
              <input
                type="number"
                min={minQuantity}
                step={minQuantity}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(minQuantity, Number(e.target.value) || minQuantity))
                }
                disabled={!!disabled || isAdding}
                className="w-full h-full text-center text-sm font-bold text-[#0f172a] focus:outline-none"
                data-testid="product-quantity-input"
                suppressHydrationWarning
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + minQuantity)}
                disabled={!!disabled || isAdding}
                className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={
                !inStock ||
                !selectedVariant ||
                !!disabled ||
                isAdding ||
                !isValidVariant
              }
              variant="primary"
              className="w-full h-11 bg-[#1C94D2] hover:bg-[#0284c7] text-white font-bold rounded-xl shadow-sm transition-all"
              isLoading={isAdding}
              data-testid="add-product-button"
            >
              {!selectedVariant
                ? "Select Option"
                : !inStock || !isValidVariant
                  ? "Out of Stock"
                  : "Add to Industrial Cart"}
            </Button>
          </div>
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
          optionsDisabled={!!disabled || isAdding || !isApproved}
        />
      </div>
    </>
  )
}
