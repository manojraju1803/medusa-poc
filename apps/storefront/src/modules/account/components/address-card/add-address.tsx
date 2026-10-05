"use client"

import { Plus } from "@medusajs/icons"
import { Button, Heading } from "@modules/common/components/ui"
import { useActionState, useEffect, useState } from "react"

import { addCustomerAddress } from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { HttpTypes } from "@medusajs/types"
import CountrySelect from "@modules/checkout/components/country-select"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"

const AddAddress = ({
  region,
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
}) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(addCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  return (
    <>
      <button
        className="border-2 border-dashed border-gray-200 hover:border-[#1C94D2] bg-gray-50/50 hover:bg-[#f0fdf4]/50 rounded-2xl p-6 min-h-[220px] h-full w-full flex flex-col items-center justify-center gap-3 transition-all group"
        onClick={open}
        data-testid="add-address-button"
      >
        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 group-hover:border-[#1C94D2] group-hover:bg-[#1C94D2] text-gray-400 group-hover:text-white flex items-center justify-center transition-all shadow-xs">
          <Plus className="w-5 h-5" />
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-sm font-bold text-[#0f172a] group-hover:text-[#1C94D2] transition-colors">
            + Add Delivery Location / Warehouse
          </span>
          <span className="text-xs text-[#64748b] mt-0.5">
            Add factory, warehouse or registered office address
          </span>
        </div>
      </button>

      <Modal isOpen={state} close={close} data-testid="add-address-modal">
        <Modal.Title>
          <Heading className="mb-2 text-lg font-bold text-[#0f172a]">Add Delivery Location</Heading>
        </Modal.Title>
        <form action={formAction}>
          <Modal.Body>
            <div className="flex flex-col gap-y-3">
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  data-testid="first-name-input"
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label="Company / Facility Name"
                name="company"
                autoComplete="organization"
                data-testid="company-input"
              />
              <Input
                label="Street Address / Plot No."
                name="address_1"
                required
                autoComplete="address-line1"
                data-testid="address-1-input"
              />
              <Input
                label="Industrial Area / Landmark / Unit"
                name="address_2"
                autoComplete="address-line2"
                data-testid="address-2-input"
              />
              <div className="grid grid-cols-[144px_1fr] gap-x-2">
                <Input
                  label="PIN / Postal code"
                  name="postal_code"
                  required
                  autoComplete="postal-code"
                  data-testid="postal-code-input"
                />
                <Input
                  label="City / District"
                  name="city"
                  required
                  autoComplete="locality"
                  data-testid="city-input"
                />
              </div>
              <Input
                label="State / Province"
                name="province"
                autoComplete="address-level1"
                data-testid="state-input"
              />
              <CountrySelect
                region={region}
                name="country_code"
                required
                autoComplete="country"
                data-testid="country-select"
              />
              <Input
                label="Contact Phone (for delivery dispatch)"
                name="phone"
                autoComplete="phone"
                data-testid="phone-input"
              />
            </div>
            {formState.error && (
              <div
                className="text-rose-500 text-xs font-semibold py-2"
                data-testid="address-error"
              >
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10 text-xs rounded-xl"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <SubmitButton
                data-testid="save-button"
                className="h-10 bg-[#1C94D2] hover:bg-[#0284c7] text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Save Delivery Location
              </SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default AddAddress
