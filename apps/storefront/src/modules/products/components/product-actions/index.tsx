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
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { VariantPriceTiers } from "types/global"
import type { StockLevel } from "@lib/data/stock-levels"
import { convertToLocale } from "@lib/util/money"
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
  // Stock per warehouse, keyed by variant id (approved viewers only)
  stockLevels?: Record<string, StockLevel[]>
  // The chip selected first, e.g. the buyer's warehouse city
  initialCity?: string
}

// MOCK for the demo: freight uplift per warehouse city. Display only; cart and
// checkout still use the base price.
const LOCATION_PRICE_FACTOR: Record<string, number> = {
  Bangalore: 1,
  Mumbai: 1.02,
  Delhi: 1.04,
}
const BASE_CITY = "Bangalore"

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
  stockLevels,
  initialCity,
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
  const [city, setCity] = useState(initialCity ?? BASE_CITY)
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

  const factor = LOCATION_PRICE_FACTOR[city] ?? 1
  const atCity = (amount: number) => Math.round(amount * factor * 100) / 100
  const cityTier = activeTier
    ? { ...activeTier, unit_amount: atCity(activeTier.unit_amount) }
    : undefined

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

  const levels =
    stockLevels?.[selectedVariant?.id ?? product.variants?.[0]?.id ?? ""] ?? []
  const cities = levels.length
    ? Array.from(new Set(levels.map((l) => l.city)))
    : [BASE_CITY]
  const cityLevels = levels.filter((l) => l.city === city)
  const stockQty = levels.length
    ? cityLevels.length
      ? cityLevels.reduce((n, l) => n + (l.stocked_quantity || 0), 0)
      : undefined
    : selectedVariant?.inventory_quantity

  const currencyCode =
    variantTiers?.currency_code ??
    selectedVariant?.calculated_price?.currency_code ??
    undefined
  // Rows of the qty x payment grid: the real slabs, else the MOQ at base price.
  const gridRows: { from: number; label: string; amount?: number }[] =
    variantTiers && variantTiers.tiers.length
      ? variantTiers.tiers.map((t) => ({
          from: t.from,
          label: t.to == null ? `${t.from}+ ${UNIT}` : `${t.from}–${t.to} ${UNIT}`,
          amount: atCity(t.unit_amount),
        }))
      : [
          {
            from: minQuantity,
            label: `${minQuantity} ${UNIT}`,
            amount:
              selectedVariant?.calculated_price?.calculated_amount != null
                ? atCity(selectedVariant.calculated_price.calculated_amount)
                : undefined,
          },
        ]

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
      <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
      <LocationBlock />
      <h2 className="text-sm font-bold text-[#0f172a] mt-7 mb-3">Select Qty & Payment</h2>
      <div
        className="rounded-xl border border-[#e6f2d6] bg-[#fafdf5] p-5 flex flex-col gap-3"
        data-testid="price-gate"
      >
        {viewer === "guest" ? (
          <>
            <div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
              <svg className="w-4 h-4 text-[#4d7c0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="w-full py-3 text-center bg-[#4d7c0f] hover:bg-[#3f6212] text-white text-sm font-bold rounded-xl"
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
            tier={cityTier}
            quantity={belowMinimum ? undefined : quantity}
          />
          {saving && (
            <span
              className="px-2.5 py-1 bg-[#4d7c0f] text-white text-[11px] font-bold rounded-full"
              data-testid="tier-saving-badge"
            >
              Save {saving.percent}% at {saving.from}+ {UNIT}
            </span>
          )}
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <LocationBlock cities={cities} selected={city} onSelect={setCity}>
            {typeof stockQty === "number" && (levels.length || selectedVariant?.manage_inventory) ? (
              <div
                className={clx(
                  "mt-5 rounded-xl border p-4 flex items-start gap-3",
                  stockQty > 0 ? "bg-[#f3fde9] border-lime-400" : "bg-amber-50 border-amber-300"
                )}
                data-testid="stock-line"
              >
                <CheckIcon className={stockQty > 0 ? "text-lime-500" : "text-amber-500"} />
                <div>
                  <div className={clx("text-xs font-semibold", stockQty > 0 ? "text-lime-600" : "text-amber-700")}>
                    General availability: {stockQty > 0 ? "In Stock" : "Out of Stock"}
                  </div>
                  <div className="text-sm font-medium text-[#0f172a] mt-0.5">
                    Stock Quantity ({city}): {stockQty > 0 ? `${stockQty.toLocaleString("en-IN")} ${UNIT}` : "0"}
                  </div>
                </div>
              </div>
            ) : null}
          </LocationBlock>

          <div className="flex items-start justify-between gap-3 mt-7 mb-3">
            <div>
              <h2 className="text-sm font-bold text-[#0f172a]">Select Qty & Payment — Tap to choose</h2>
              <p className="text-[10px] text-[#64748b] mt-0.5">
                Price per {UNIT} by quantity slab. Payment term does not change the price.
              </p>
            </div>
            <div className="shrink-0 px-3 py-2 bg-gray-100 rounded-xl text-[10px] font-semibold text-[#64748b] text-center">
              {quantity}{UNIT} · {PAYMENT_TERMS.find((t) => t.value === paymentTerm)?.label ?? "Select term"}
            </div>
          </div>

          <div className="overflow-x-auto pb-2" data-testid="payment-terms">
            <table className="w-full min-w-[360px] border-separate border-spacing-x-1.5 border-spacing-y-1" data-testid="price-tier-table">
              <thead>
                <tr>
                  <th className="w-20 px-1 py-2 text-left text-[10px] font-medium text-[#64748b]">Qty</th>
                  {PAYMENT_TERMS.map((term) => (
                    <th
                      key={term.value}
                      className={clx(
                        "min-w-[82px] px-1 py-2 text-center text-[10px] font-semibold",
                        paymentTerm === term.value ? "text-[#0077cf]" : "text-[#64748b]"
                      )}
                    >
                      {term.value === "advance" ? "Adv." : term.label.replace(" days", "D")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gridRows.map((row) => {
                  const rowActive = activeTier ? activeTier.from === row.from : row === gridRows[0]
                  return (
                    <tr key={row.from} data-testid="price-tier-row" data-active={rowActive}>
                      <th className={clx("px-1 py-1.5 text-left text-xs font-bold", rowActive ? "text-[#0077cf]" : "text-[#0f172a]")}>
                        {row.label}
                      </th>
                      {PAYMENT_TERMS.map((term) => {
                        const selected = rowActive && paymentTerm === term.value
                        return (
                          <td key={term.value} className="p-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setQuantity(Math.max(row.from, minQuantity))
                                choosePaymentTerm(term.value)
                              }}
                              aria-pressed={selected}
                              className={clx(
                                "w-full min-h-12 px-2 py-1.5 rounded-xl border text-center transition-all",
                                selected
                                  ? "bg-[#0077cf] border-[#0077cf] text-white shadow-sm"
                                  : "bg-gray-50 border-gray-100 text-[#0f172a] hover:border-[#0077cf]/40"
                              )}
                            >
                              <span className="block text-xs font-extrabold">
                                {row.amount != null && currencyCode
                                  ? convertToLocale({ amount: row.amount, currency_code: currencyCode })
                                  : "—"}
                              </span>
                              <span className={clx("block text-[8px]", selected ? "text-white/80" : "text-[#64748b]")}>
                                {row.amount != null ? `/${UNIT}` : "Not available"}
                              </span>
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-1 pt-2 border-t border-gray-100 text-[9px] text-[#64748b]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0077cf]" /> Selected
            </span>
            {saving && <span>Save {saving.percent}% at {saving.from}+ {UNIT}</span>}
          </div>
          <p className="mt-2 text-[10px] text-[#64748b]" data-testid="location-price-note">
            Prices for {city} include freight. Bangalore is the base warehouse.
          </p>
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
            className="flex-1 h-11 bg-[#4d7c0f] hover:bg-[#3f6212] disabled:bg-gray-300 text-white text-sm font-bold rounded-xl"
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
          <div className="text-sm text-[#4d7c0f] font-semibold" data-testid="added-to-cart">
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
          activeTier={cityTier}
          addDisabled={belowMinimum}
        />
      </div>
    </>
  )
}

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={clx("w-5 h-5 shrink-0 mt-0.5", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

// Warehouse chips from the stock levels; guests and unapproved viewers get
// the single fixed Bangalore chip.
function LocationBlock({
  children,
  cities = [BASE_CITY],
  selected = BASE_CITY,
  onSelect,
}: {
  children?: ReactNode
  cities?: string[]
  selected?: string
  onSelect?: (city: string) => void
}) {
  return (
    <>
      <h2 className="flex items-center gap-2 text-sm font-bold text-[#0f172a] mb-3">
        <svg className="w-4 h-4 text-[#0077cf]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z" />
          <circle cx="12" cy="10" r="2" />
        </svg>
        Select Location
      </h2>
      <div className="flex flex-wrap gap-2" data-testid="location-chips">
        {cities.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onSelect?.(c)}
            disabled={!onSelect}
            aria-pressed={c === selected}
            className={clx(
              "inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl border",
              c === selected
                ? "bg-[#0077cf] border-[#0077cf] text-white shadow-sm"
                : "bg-white border-gray-200 text-[#0f172a] hover:border-[#0077cf]/40"
            )}
          >
            {c}
          </button>
        ))}
      </div>
      {children}
    </>
  )
}
