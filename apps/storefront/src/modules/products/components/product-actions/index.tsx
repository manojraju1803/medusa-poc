"use client"

import { addToCart, updateCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { minQuantityOf } from "@lib/util/min-quantity"
import { findPriceTier } from "@lib/util/price-tiers"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ErrorMessage from "@modules/checkout/components/error-message"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { UNIT, Viewer, tierSaving } from "@modules/products/lib/access"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { VariantPriceTiers } from "types/global"
import PriceTierTable from "../price-tier-table"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

export const PAYMENT_TERMS = [
  { value: "advance", label: "Advance" },
  { value: "15_days", label: "15 days" },
  { value: "30_days", label: "30 days" },
] as const

type PaymentTerm = (typeof PAYMENT_TERMS)[number]["value"]

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  viewer?: Viewer
  priceTiers?: VariantPriceTiers[]
  // The current cart, if any, for the payment-term label
  cart?: { id: string; metadata?: Record<string, unknown> | null } | null
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"],
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

const isPaymentTerm = (v: unknown): v is PaymentTerm =>
  PAYMENT_TERMS.some((t) => t.value === v)

export default function ProductActions({
  product,
  disabled,
  viewer = "guest",
  priceTiers,
  cart,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const approved = viewer === "approved"

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
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(() =>
    product.variants?.length === 1 ? minQuantityOf(product.variants[0]) : 1
  )
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm | undefined>(() =>
    isPaymentTerm(cart?.metadata?.payment_term)
      ? (cart!.metadata!.payment_term as PaymentTerm)
      : undefined
  )
  const [hasCart, setHasCart] = useState(!!cart?.id)
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

    router.replace(pathname + "?" + params.toString(), { scroll: false })
  }, [selectedVariant, isValidVariant])

  const minQuantity = useMemo(
    () => minQuantityOf(selectedVariant ?? product.variants?.[0]),
    [selectedVariant, product.variants]
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
  const saving = tierSaving(variantTiers?.tiers)

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

  const stockQty = selectedVariant?.inventory_quantity

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // Label only: stored on the cart, no effect on price.
  const saveTerm = async (term: PaymentTerm) => {
    await updateCart({
      metadata: { ...(cart?.metadata ?? {}), payment_term: term },
    }).catch((err) => setError(err.message))
  }

  // Without a cart yet, the choice is kept here and written after add to cart.
  const choosePaymentTerm = (term: PaymentTerm) => {
    setPaymentTerm(term)
    if (hasCart) saveTerm(term)
  }

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setError(null)
    setAdded(false)
    setIsAdding(true)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity,
        countryCode,
      })
      setAdded(true)
      // A cart exists now; write a term chosen before it did.
      if (paymentTerm && !hasCart) {
        await saveTerm(paymentTerm)
      }
      setHasCart(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsAdding(false)
    }
  }

  if (!approved) {
    const moq = minQuantityOf(product.variants?.[0])
    return (
      <div
        className="rounded-xl border border-[#e2f3eb] bg-[#f8fffe] p-5 flex flex-col gap-3"
        data-testid="price-gate"
      >
        {viewer === "guest" ? (
          <>
            <div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
              <svg className="w-4 h-4 text-[#006B4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pricing & stock for verified buyers
            </div>
            <p className="text-xs text-[#64748b]">
              Sign in with an approved business account to see bulk prices,
              quantity slabs and live stock.
            </p>
            <LocalizedClientLink
              href="/account"
              className="w-full py-3 text-center bg-[#006B4F] hover:bg-[#005a42] text-white text-sm font-bold rounded-xl"
              data-testid="login-to-view-price"
            >
              Login to view price & stock
            </LocalizedClientLink>
          </>
        ) : (
          <>
            <div className="text-sm font-bold text-amber-700">
              Your account is awaiting approval
            </div>
            <p className="text-xs text-[#64748b]">
              Prices, quantity slabs and stock appear once our team approves
              your business account. You can still request a quote or a sample
              below.
            </p>
          </>
        )}
        {moq > 1 && (
          <span className="text-xs text-[#64748b]">
            Minimum order: {moq} {UNIT}
          </span>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-y-4" ref={actionsRef}>
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
          </div>
        )}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <ProductPrice
            product={product}
            variant={selectedVariant}
            isLoggedIn
            tier={activeTier}
            quantity={belowMinimum ? undefined : quantity}
          />
          {saving && (
            <span
              className="px-2.5 py-1 bg-[#006B4F] text-white text-[11px] font-bold rounded-full"
              data-testid="tier-saving-badge"
            >
              Save {saving.percent}% at {saving.from}+ {UNIT}
            </span>
          )}
        </div>

        {typeof stockQty === "number" && selectedVariant?.manage_inventory && (
          <div
            className={clx(
              "rounded-xl border p-3 text-sm font-medium",
              stockQty > 0
                ? "bg-[#f3fde9] border-lime-300 text-[#0f172a]"
                : "bg-amber-50 border-amber-300 text-amber-800"
            )}
            data-testid="stock-line"
          >
            {stockQty > 0
              ? `${stockQty.toLocaleString("en-IN")} ${UNIT} in stock · Bangalore warehouse`
              : "Out of stock · Bangalore warehouse"}
          </div>
        )}

        {variantTiers && variantTiers.tiers.length > 1 && (
          <div className="rounded-xl border border-gray-100 p-3">
            <div className="text-xs font-bold text-[#0f172a] mb-2">
              Quantity pricing ({UNIT})
            </div>
            <PriceTierTable
              tiers={variantTiers.tiers}
              currencyCode={variantTiers.currency_code}
              activeFrom={activeTier?.from}
            />
          </div>
        )}

        <div>
          <div className="text-xs font-bold text-[#0f172a] mb-2">Payment term</div>
          <div className="flex flex-wrap gap-2" data-testid="payment-terms">
            {PAYMENT_TERMS.map((term) => (
              <button
                key={term.value}
                type="button"
                onClick={() => choosePaymentTerm(term.value)}
                aria-pressed={paymentTerm === term.value}
                className={clx(
                  "px-4 py-2 text-xs font-bold rounded-xl border transition-all",
                  paymentTerm === term.value
                    ? "bg-[#006B4F] border-[#006B4F] text-white"
                    : "bg-white border-gray-200 text-[#0f172a] hover:border-[#006B4F]/40"
                )}
              >
                {term.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-x-2">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-11">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((q) => Math.max(minQuantity, q - 1))}
              disabled={quantity <= minQuantity || isAdding}
              className="w-9 h-full text-lg text-[#0f172a] disabled:text-gray-300 hover:bg-gray-50"
            >
              −
            </button>
            <input
              type="number"
              min={minQuantity}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Number(e.target.value) || 1))
              }
              disabled={!!disabled || isAdding}
              className="w-16 h-full text-center text-sm font-semibold outline-none border-x border-gray-200"
              data-testid="product-quantity-input"
              aria-label={`Quantity (${UNIT})`}
            />
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((q) => q + 1)}
              disabled={isAdding}
              className="w-9 h-full text-lg text-[#0f172a] hover:bg-gray-50"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              !isValidVariant ||
              belowMinimum
            }
            className="flex-1 h-11 bg-[#006B4F] hover:bg-[#005a42] disabled:bg-gray-300 text-white text-sm font-bold rounded-xl"
            data-testid="add-product-button"
          >
            {isAdding
              ? "Adding…"
              : !selectedVariant
                ? "Select variant"
                : !inStock || !isValidVariant
                  ? "Out of stock"
                  : "Add to cart"}
          </button>
        </div>
        {minQuantity > 1 && (
          <span
            className={clx("text-xs", {
              "text-red-600": belowMinimum,
              "text-[#64748b]": !belowMinimum,
            })}
            data-testid="min-quantity-hint"
          >
            Minimum order: {minQuantity} {UNIT}
          </span>
        )}
        {added && (
          <div className="text-sm text-[#006B4F] font-semibold" data-testid="added-to-cart">
            Added to cart ·{" "}
            <LocalizedClientLink href="/cart" className="underline">
              View cart
            </LocalizedClientLink>
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
          optionsDisabled={!!disabled || isAdding}
          activeTier={activeTier}
          addDisabled={belowMinimum}
        />
      </div>
    </>
  )
}
