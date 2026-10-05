"use client"

import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { PencilSquare as Edit, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import CountrySelect from "@modules/checkout/components/country-select"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import { Button, Heading, Text, clx } from "@modules/common/components/ui"
import Spinner from "@modules/common/icons/spinner"
import React, { useActionState, useEffect, useState } from "react"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
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

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={clx(
          "bg-white rounded-2xl border border-gray-200/80 p-5 min-h-[220px] h-full w-full flex flex-col justify-between shadow-xs transition-all hover:border-[#1C94D2]",
          {
            "border-[#1C94D2] ring-2 ring-[#bbf7d0]/50": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div className="flex flex-col gap-2">
          {/* Header Tag / Company */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <Heading
                className="text-left text-sm font-bold text-[#0f172a]"
                data-testid="address-name"
              >
                {address.first_name} {address.last_name}
              </Heading>
              {address.company && (
                <Text
                  className="text-xs font-semibold text-[#1C94D2] mt-0.5"
                  data-testid="address-company"
                >
                  🏢 {address.company}
                </Text>
              )}
            </div>
            {address.is_default_shipping && (
              <span className="text-[10px] font-bold text-[#166534] bg-[#dcfce7] border border-[#bbf7d0] px-2 py-0.5 rounded-full shrink-0">
                Default Shipping
              </span>
            )}
            {address.is_default_billing && (
              <span className="text-[10px] font-bold text-[#1e40af] bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 rounded-full shrink-0">
                Default Billing
              </span>
            )}
          </div>

          {/* Detailed Street Address */}
          <div className="flex flex-col text-left text-xs text-[#64748b] leading-relaxed mt-1">
            <span data-testid="address-address">
              {address.address_1}
              {address.address_2 && <span>, {address.address_2}</span>}
            </span>
            <span data-testid="address-postal-city">
              {address.city} - {address.postal_code}
            </span>
            <span data-testid="address-province-country">
              {address.province && `${address.province}, `}
              {address.country_code?.toUpperCase()}
            </span>
            {address.phone && (
              <span className="text-[11px] text-[#475569] mt-1">
                📞 {address.phone}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
          <button
            className="text-xs font-semibold text-[#1C94D2] hover:text-[#0284c7] flex items-center gap-1.5 transition-colors"
            onClick={open}
            data-testid="address-edit-button"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Location
          </button>
          <button
            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition-colors"
            onClick={removeAddress}
            data-testid="address-delete-button"
          >
            {removing ? <Spinner /> : <Trash className="w-3.5 h-3.5" />}
            Remove
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          <Heading className="mb-2 text-lg font-bold text-[#0f172a]">Edit Delivery Location</Heading>
        </Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-3">
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  defaultValue={address.first_name || undefined}
                  data-testid="first-name-input"
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  defaultValue={address.last_name || undefined}
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label="Company / Facility Name"
                name="company"
                autoComplete="organization"
                defaultValue={address.company || undefined}
                data-testid="company-input"
              />
              <Input
                label="Street Address / Plot No."
                name="address_1"
                required
                autoComplete="address-line1"
                defaultValue={address.address_1 || undefined}
                data-testid="address-1-input"
              />
              <Input
                label="Industrial Area / Landmark / Unit"
                name="address_2"
                autoComplete="address-line2"
                defaultValue={address.address_2 || undefined}
                data-testid="address-2-input"
              />
              <div className="grid grid-cols-[144px_1fr] gap-x-2">
                <Input
                  label="PIN / Postal code"
                  name="postal_code"
                  required
                  autoComplete="postal-code"
                  defaultValue={address.postal_code || undefined}
                  data-testid="postal-code-input"
                />
                <Input
                  label="City / District"
                  name="city"
                  required
                  autoComplete="locality"
                  defaultValue={address.city || undefined}
                  data-testid="city-input"
                />
              </div>
              <Input
                label="State / Province"
                name="province"
                autoComplete="address-level1"
                defaultValue={address.province || undefined}
                data-testid="state-input"
              />
              <CountrySelect
                name="country_code"
                region={region}
                required
                autoComplete="country"
                defaultValue={address.country_code || undefined}
                data-testid="country-select"
              />
              <Input
                label="Contact Phone (for delivery dispatch)"
                name="phone"
                autoComplete="phone"
                defaultValue={address.phone || undefined}
                data-testid="phone-input"
              />
            </div>
            {formState.error && (
              <div className="text-rose-500 text-xs font-semibold py-2">
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
                Update Location
              </SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default EditAddress
