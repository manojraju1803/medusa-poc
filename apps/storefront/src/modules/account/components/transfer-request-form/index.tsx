"use client"
import { createTransferRequest } from "@lib/data/orders"
import { CheckCircleMiniSolid, XCircleSolid } from "@medusajs/icons"
import { Heading, IconButton, Input, Text } from "@modules/common/components/ui"
import { useActionState } from "react"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { useEffect, useState } from "react"

export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <div className="p-6 rounded-2xl bg-gray-50/70 border border-gray-200/80 flex flex-col gap-y-4 w-full">
      <div className="grid sm:grid-cols-2 items-center gap-x-8 gap-y-4 w-full">
        <div className="flex flex-col gap-y-1">
          <Heading level="h3" className="text-sm font-bold text-[#0f172a]">
            Connect Past Orders
          </Heading>
          <p className="text-xs text-[#64748b]">
            Placed an order before creating your account? Link it to your B2B profile using your Order ID.
          </p>
        </div>
        <form
          action={formAction}
          className="flex flex-col gap-y-1 sm:items-end"
        >
          <div className="flex gap-2 w-full">
            <Input className="flex-1 text-xs" name="order_id" placeholder="Enter Order ID (e.g. order_01...)" />
            <SubmitButton
              variant="secondary"
              size="small"
              className="h-10 text-xs font-semibold px-4 rounded-xl border-[#1C94D2] text-[#1C94D2] hover:bg-[#1C94D2] hover:text-white transition-colors"
            >
              Link Order
            </SubmitButton>
          </div>
        </form>
      </div>
      {!state.success && state.error && (
        <Text className="text-xs font-semibold text-rose-500 text-right">
          {state.error}
        </Text>
      )}
      {showSuccess && (
        <div className="flex justify-between p-4 rounded-xl bg-[#dcfce7] border border-[#bbf7d0] w-full self-stretch items-center">
          <div className="flex gap-x-2 items-center">
            <CheckCircleMiniSolid className="w-5 h-5 text-[#166534]" />
            <div className="flex flex-col">
              <Text className="text-xs font-bold text-[#166534]">
                Transfer for order #{state.order?.id} requested
              </Text>
              <Text className="text-[11px] text-[#166534]/80">
                A confirmation link has been dispatched to {state.order?.email}
              </Text>
            </div>
          </div>
          <IconButton
            className="h-fit"
            onClick={() => setShowSuccess(false)}
          >
            <XCircleSolid className="w-4 h-4 text-[#166534]" />
          </IconButton>
        </div>
      )}
    </div>
  )
}
