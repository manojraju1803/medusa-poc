"use client"

import {
  AccountRole,
  COMPANY_NATURES,
  INDIAN_STATES,
  isRequired,
} from "@lib/util/registration"
import RegField from "./reg-field"
import {
  AgreementField,
  FormActions,
  FormAlert,
  FormSection,
  RegisterBanner,
  RoleTabs,
  VerificationNotice,
} from "./shared"
import { useRegistration } from "./use-registration"

// Buyers and R&D professionals register with the same company form.
const BuyerForm = ({
  role,
  onRoleChange,
  onSignIn,
}: {
  role: Extract<AccountRole, "buyer" | "rnd">
  onRoleChange: (role: AccountRole) => void
  onSignIn: () => void
}) => {
  const reg = useRegistration(role)
  const { values, setValue, errors } = reg
  const isRnd = role === "rnd"

  const field = (name: string) => ({
    name,
    value: values[name] ?? "",
    onChange: setValue,
    error: errors[name],
    required: isRequired(role, name),
  })

  return (
    <div className="min-h-screen bg-[#f4f7f8]" data-testid="register-page">
      <RegisterBanner
        title={isRnd ? "R&D Registration" : "Buyer Registration"}
        subtitle={
          isRnd
            ? "Research ingredients, compare specifications and manage development sourcing."
            : "Source verified food and nutra ingredients with live stock and slab pricing."
        }
        image={isRnd ? "/home-hero.jpg" : "/home-hero-2.jpg"}
      />
      <main className="relative max-w-[1180px] mx-auto px-4 sm:px-6 -mt-20 pb-12">
        <div className="bg-white rounded-3xl border border-[#e5e7eb] overflow-hidden shadow-[0_20px_50px_rgba(0,37,77,0.15)]">
          <RoleTabs role={role} onChange={onRoleChange} />
          {reg.state?.state === "verification_required" ? (
            <VerificationNotice email={reg.state.email} />
          ) : (
            <form onSubmit={reg.submit} noValidate>
              {(reg.hasErrors || reg.formError) && (
                <div className="px-5 sm:px-8 pb-5">
                  <FormAlert>
                    {reg.formError ?? "Please review the highlighted fields and agreement selection."}
                  </FormAlert>
                </div>
              )}

              <FormSection
                title="Company Details"
                subtitle={
                  isRnd
                    ? "Register your organisation to research ingredients and manage development sourcing."
                    : "Register your business to source verified ingredients through Ingredients Bazar."
                }
                className="grid md:grid-cols-2 gap-x-6 gap-y-5"
              >
                <RegField {...field("company_name")} label="Company Name" placeholder="Enter company name" autoComplete="organization" />
                <RegField {...field("company_nature")} label="Nature of Company" options={COMPANY_NATURES} />
                <RegField {...field("registered_address")} label="Registered Office Address" textarea maxLength={300} placeholder="Enter registered office address" />
                <RegField {...field("city")} label="City Name" placeholder="Enter city name" autoComplete="address-level2" maxLength={60} />
                <RegField {...field("state")} label="State Name" options={INDIAN_STATES} />
                <RegField {...field("postcode")} label="PIN Code" placeholder="400001" inputMode="numeric" maxLength={6} digitsOnly autoComplete="postal-code" />
                <RegField {...field("gst_number")} label="GST Number" placeholder="Example: 22AAAAA0000A1Z5" maxLength={15} />
                <RegField {...field("fssai_number")} label="FSSAI Licence Number" placeholder="14-digit licence number" inputMode="numeric" maxLength={14} digitsOnly />
              </FormSection>

              <FormSection
                title="Contact Person"
                subtitle="Who we should contact about orders and approvals."
                className="grid md:grid-cols-2 gap-x-6 gap-y-5"
              >
                <RegField {...field("contact_person")} label="Contact Person" placeholder="Enter contact person name" autoComplete="name" maxLength={100} />
                <RegField {...field("designation")} label="Designation" placeholder="Enter designation" autoComplete="organization-title" />
                <RegField {...field("mobile")} label="Mobile Number" type="tel" placeholder="10-digit mobile number" inputMode="numeric" maxLength={10} digitsOnly autoComplete="tel-national" />
                <RegField {...field("telephone")} label="Telephone Number" type="tel" placeholder="With STD code, e.g. 08012345678" inputMode="numeric" maxLength={12} digitsOnly />
                <RegField {...field("email")} label="E-mail Id" type="email" placeholder="name@company.com" autoComplete="email" maxLength={100} />
                <RegField {...field("confirm_email")} label="Confirm E-mail Id" type="email" placeholder="Same as above" autoComplete="off" />
                <div className="md:col-span-2">
                  <RegField {...field("contact_address")} label="Contact Person Address" textarea maxLength={300} placeholder="Enter the contact person's address" autoComplete="street-address" />
                </div>
              </FormSection>

              <FormSection
                title="Account Details"
                subtitle="You'll sign in with your e-mail and this password."
                className="grid md:grid-cols-2 gap-x-6 gap-y-5"
              >
                <RegField
                  {...field("password")}
                  label="Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  maxLength={128}
                  help="Use at least 8 characters with a mix of letters and numbers."
                />
                <RegField
                  {...field("confirm_password")}
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  maxLength={128}
                />
              </FormSection>

              <FormSection title="Terms & Conditions">
                <AgreementField
                  text="Agreed to terms and conditions of ingredientsbazar.com/Saisukrithkar Supplements Private Limited"
                  value={values.agreement}
                  onChange={setValue}
                  error={errors.agreement}
                />
                <FormActions pending={reg.pending} onSignIn={onSignIn} />
              </FormSection>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}

export default BuyerForm
