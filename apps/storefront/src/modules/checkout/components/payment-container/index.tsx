import { Radio as RadioGroupOption } from "@headlessui/react"
import { Text, clx } from "@modules/common/components/ui"
import React, { useContext, type JSX } from "react"

import Radio from "@modules/common/components/radio"

import { isManual } from "@lib/constants"
import SkeletonCardDetails from "@modules/skeletons/components/skeleton-card-details"
import { PaymentElement } from "@stripe/react-stripe-js"
import PaymentTest from "../payment-test"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
  children?: React.ReactNode
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={clx(
        "flex flex-col gap-y-2 text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
        {
          "border-ui-border-interactive":
            selectedPaymentOptionId === paymentProviderId,
        }
      )}
    >
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-x-4">
          <Radio checked={selectedPaymentOptionId === paymentProviderId} />
          <Text className="text-base-regular">
            {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
          </Text>
          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden small:block" />
          )}
        </div>
        <span className="justify-self-end text-ui-fg-base">
          {paymentInfoMap[paymentProviderId]?.icon}
        </span>
      </div>
      {isManual(paymentProviderId) && isDevelopment && (
        <PaymentTest className="small:hidden text-[10px]" />
      )}
      {selectedPaymentOptionId === paymentProviderId && isManual(paymentProviderId) && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2.5 text-xs text-gray-600">
          <div className="flex items-center gap-2 bg-[#f0fdf4] text-[#006B4F] px-3 py-2 rounded-xl border border-[#bbf7d0]">
            <svg className="w-4 h-4 shrink-0 text-[#006B4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-[11px]">
              Demo Environment: Orders are created, confirmed, and dispatched with mock payment approval.
            </span>
          </div>
          <div className="grid grid-cols-1 small:grid-cols-3 gap-2 mt-1">
            <div className="p-2.5 bg-[#f8fafc] border border-gray-200 rounded-xl flex flex-col gap-0.5">
              <span className="font-bold text-gray-900 text-[11px] flex items-center gap-1">
                <span>⚡</span> Instant Mock Approval
              </span>
              <span className="text-[10px] text-gray-500">Simulated card & net banking</span>
            </div>
            <div className="p-2.5 bg-[#f8fafc] border border-gray-200 rounded-xl flex flex-col gap-0.5">
              <span className="font-bold text-gray-900 text-[11px] flex items-center gap-1">
                <span>🏦</span> Corporate NEFT / RTGS
              </span>
              <span className="text-[10px] text-gray-500">Virtual account transfer</span>
            </div>
            <div className="p-2.5 bg-[#f8fafc] border border-gray-200 rounded-xl flex flex-col gap-0.5">
              <span className="font-bold text-gray-900 text-[11px] flex items-center gap-1">
                <span>📑</span> Net 30 B2B Credit
              </span>
              <span className="text-[10px] text-gray-500">Approved buyer credit terms</span>
            </div>
          </div>
        </div>
      )}
      {children}
    </RadioGroupOption>
  )
}

export default PaymentContainer

export const StripePaymentContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  setError,
  setPaymentComplete,
}: Omit<PaymentContainerProps, "children"> & {
  setError: (error: string | null) => void
  setPaymentComplete: (complete: boolean) => void
}) => {
  const stripeReady = useContext(StripeContext)

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {selectedPaymentOptionId === paymentProviderId &&
        (stripeReady ? (
          <div className="my-4 transition-all duration-150 ease-in-out">
            <Text className="txt-medium-plus text-ui-fg-base mb-1">
              Enter your payment details:
            </Text>
            <PaymentElement
              options={{ layout: "accordion" }}
              onChange={(e) => {
                setError(null)
                setPaymentComplete(e.complete)
              }}
              // Without a handler Stripe.js reports a failed mount as an
              // unhandled "payment Element loaderror" and the option renders
              // blank with no explanation. Surface it in the checkout's own
              // error slot instead.
              onLoadError={(e) => {
                setPaymentComplete(false)
                setError(
                  e.error?.message ?? "Could not load the payment methods."
                )
              }}
            />
          </div>
        ) : (
          <SkeletonCardDetails />
        ))}
    </PaymentContainer>
  )
}
