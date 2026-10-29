"use client"

import {
  MOCK_PAYMENT_PROVIDER_ID,
  isManual,
  isStripeLike,
} from "@lib/constants"
import { initiatePaymentSession, placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import { useParams } from "next/navigation"
import React, { useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton
          cart={cart}
          notReady={notReady}
          data-testid={dataTestId}
        />
      )
    default:
      return <Button disabled>Select a payment method</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const { countryCode } = useParams()

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    if (!stripe || !elements || !cart) {
      return
    }

    setSubmitting(true)

    await stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/api/payment-return?cart_id=${cart.id}&country_code=${countryCode}`,
          payment_method_data: {
            billing_details: {
              name:
                cart.billing_address?.first_name +
                " " +
                cart.billing_address?.last_name,
              address: {
                city: cart.billing_address?.city ?? undefined,
                country: cart.billing_address?.country_code ?? undefined,
                line1: cart.billing_address?.address_1 ?? undefined,
                line2: cart.billing_address?.address_2 ?? undefined,
                postal_code: cart.billing_address?.postal_code ?? undefined,
                state: cart.billing_address?.province ?? undefined,
              },
              email: cart.email,
              phone: cart.billing_address?.phone ?? undefined,
            },
          },
        },
        // Only leave the site when the selected method actually requires it, so
        // card payments still complete inline.
        redirect: "if_required",
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
            return
          }

          setErrorMessage(error.message || null)
          setSubmitting(false)
          return
        }

        if (
          paymentIntent.status === "requires_capture" ||
          paymentIntent.status === "succeeded"
        ) {
          onPaymentCompleted()
          return
        }

        setSubmitting(false)
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        className="!bg-[#4d7c0f] hover:!bg-[#3f6212] !rounded-xl font-bold w-full"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({
  cart,
  notReady,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [authStep, setAuthStep] = useState<
    "idle" | "authorizing" | "authorized" | "failed"
  >("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Both paths go through the backend's mock payment provider: the outcome is
  // stored on a fresh payment session, and completing the cart authorizes it.
  // A decline makes the backend reject cart completion, so the cart stays open.
  const pay = async (outcome: "success" | "decline") => {
    setSubmitting(true)
    setErrorMessage(null)
    setAuthStep("authorizing")

    try {
      await initiatePaymentSession(cart, {
        provider_id: MOCK_PAYMENT_PROVIDER_ID,
        data: { mock_outcome: outcome },
      })
      setAuthStep("authorized")
      await placeOrder()
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err))
      setAuthStep(outcome === "decline" ? "failed" : "idle")
      setSubmitting(false)
    }
  }

  const handlePaySuccess = () => pay("success")
  const handleSimulateFailure = () => pay("decline")

  const handleRetry = () => {
    setAuthStep("idle")
    setErrorMessage(null)
    setSubmitting(false)
  }

  if (authStep === "failed") {
    return (
      <div className="flex flex-col gap-4 w-full p-5 bg-red-50/80 border border-red-200 rounded-2xl animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 mt-0.5">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-red-900">
              Payment Failed (Simulated Test Path)
            </h3>
            <p className="text-xs text-red-700 mt-1">
              {errorMessage || "Simulated gateway decline. The transaction was cancelled."}
            </p>
            <p className="text-[11px] text-red-600/90 font-medium mt-1">
              ✓ Cart items, quantities, addresses, and shipping remain completely unchanged.
            </p>
          </div>
        </div>

        <Button
          onClick={handleRetry}
          size="large"
          className="!bg-red-600 hover:!bg-red-700 !text-white !rounded-xl font-bold w-full"
          data-testid="retry-payment-button"
        >
          Retry Payment
        </Button>
      </div>
    )
  }

  const getButtonText = () => {
    if (authStep === "authorizing") return "Authorizing Mock Payment..."
    if (authStep === "authorized") return "Payment Approved ✓ Creating Order..."
    return "Pay (Success)"
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="grid grid-cols-1 small:grid-cols-2 gap-3">
        <Button
          disabled={notReady || submitting}
          isLoading={submitting && authStep === "authorizing"}
          onClick={handlePaySuccess}
          size="large"
          className="!bg-[#4d7c0f] hover:!bg-[#3f6212] !rounded-xl font-bold w-full transition-all flex items-center justify-center gap-2"
          data-testid="submit-order-button"
        >
          <span>✓</span> {getButtonText()}
        </Button>

        <Button
          disabled={notReady || submitting}
          onClick={handleSimulateFailure}
          size="large"
          variant="secondary"
          className="!bg-white hover:!bg-red-50 !text-red-600 !border-red-200 hover:!border-red-300 !rounded-xl font-bold w-full transition-all flex items-center justify-center gap-2"
          data-testid="simulate-failure-button"
        >
          <span>✕</span> Fail (Simulate Decline)
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
        <svg
          className="w-3.5 h-3.5 text-[#4d7c0f]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>
          Demo Environment · Use &ldquo;Pay&rdquo; to complete order or &ldquo;Fail&rdquo; to test error handling
        </span>
      </div>

      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </div>
  )
}

export default PaymentButton
