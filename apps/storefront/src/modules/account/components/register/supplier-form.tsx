"use client"

import {
  AccountRole,
  BUSINESS_NATURES,
  COMPANY_NATURES,
  DOCUMENT_ACCEPT,
  DOCUMENT_HINT,
  documentField,
  isRequired,
  QUALITY_DOCUMENTS,
} from "@lib/util/registration"
import { SupplierServicesList } from "../brand-content"
import { openLocalFile } from "@lib/util/open-local-file"
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

const HIGHLIGHTS = [
  {
    value: "₹1,000",
    title: "Annual maintenance",
    text: "Annual maintenance charge per ingredient listed on the platform.",
  },
  {
    value: "Bulk stock",
    title: "Clearance opportunity",
    text: "Opportunity to feature eligible inventory in the bulk stock clearance banner.",
  },
  {
    value: "24–48 hours",
    title: "Account approval",
    text: "Registration details are reviewed before supplier account activation.",
  },
]

const UploadIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14" />
  </svg>
)

const SupplierForm = ({
  onRoleChange,
  onSignIn,
}: {
  onRoleChange: (role: AccountRole) => void
  onSignIn: () => void
}) => {
  const reg = useRegistration("supplier")
  const { values, setValue, errors, documents, setDocument } = reg

  const field = (name: string) => ({
    name,
    value: values[name] ?? "",
    onChange: setValue,
    error: errors[name],
    required: isRequired("supplier", name),
  })

  return (
    <div className="min-h-screen bg-[#f4f7f8]" data-testid="register-page">
      <RegisterBanner
        title="Supplier Registration"
        subtitle="Showcase your ingredients to qualified food, nutraceutical and pharmaceutical buyers across India."
        image="/register-supplier.jpg"
      />

      <main className="relative max-w-[1180px] mx-auto px-4 sm:px-6 -mt-20 pb-12">
        <div className="bg-white rounded-3xl border border-[#e5e7eb] overflow-hidden shadow-[0_20px_50px_rgba(0,37,77,0.15)]">
        <RoleTabs role="supplier" onChange={onRoleChange} />
        <FormSection
          title="Why join as a supplier"
          subtitle="List verified ingredients, share quality documentation, connect with active B2B buyers and receive sourcing enquiries."
          className="grid md:grid-cols-3 gap-3"
        >
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="border border-[#e5e7eb] rounded-xl p-4 bg-[#f8fffe]">
              <div className="text-lg font-extrabold text-[#0757a8]">{h.value}</div>
              <div className="text-xs font-bold text-[#0f172a] mt-1">{h.title}</div>
              <p className="text-[11px] text-[#64748b] leading-relaxed mt-1">{h.text}</p>
            </div>
          ))}
        </FormSection>

        <FormSection title="What we do for suppliers">
          <SupplierServicesList />
        </FormSection>

        {reg.state?.state === "verification_required" ? (
          <VerificationNotice email={reg.state.email} />
        ) : (
          <form onSubmit={reg.submit} noValidate>
            {(reg.hasErrors || reg.formError) && (
              <div className="px-5 sm:px-8 py-5 border-t border-[#e5e7eb]">
                <FormAlert>
                  {reg.formError ?? "Please review the highlighted fields before submitting your registration."}
                </FormAlert>
              </div>
            )}

            <FormSection
              title="Supplier Information"
              subtitle={<>Fields marked with <span className="text-red-500">*</span> are required.</>}
              className="grid md:grid-cols-2 gap-x-6 gap-y-5"
            >
              <RegField {...field("company_name")} label="Company Name" placeholder="Enter registered company name" autoComplete="organization" />
              <RegField {...field("company_nature")} label="Nature of Company" options={COMPANY_NATURES} />
              <RegField {...field("registered_address")} label="Registered Office Address" textarea maxLength={300} placeholder="Enter complete registered office address" />
              <RegField {...field("warehouse_address")} label="Warehouse/Plant Address" textarea maxLength={300} placeholder="Enter complete warehouse or plant address" />
              <RegField {...field("gst_number")} label="GST Number" placeholder="Example: 22AAAAA0000A1Z5" maxLength={15} />
              <RegField {...field("fssai_number")} label="FSSAI Licence Number" placeholder="14-digit licence number" inputMode="numeric" maxLength={14} digitsOnly />
              <RegField {...field("mobile")} label="Mobile Number" type="tel" placeholder="10-digit mobile number" inputMode="numeric" maxLength={10} digitsOnly autoComplete="tel-national" />
              <RegField {...field("telephone")} label="Telephone Number" type="tel" placeholder="With STD code, e.g. 08012345678" inputMode="numeric" maxLength={12} digitsOnly />
              <RegField {...field("email")} label="E-mail Id" type="email" placeholder="Enter business e-mail address" autoComplete="email" maxLength={100} />
              <RegField {...field("business_nature")} label="Nature of Business" options={BUSINESS_NATURES} />
              <RegField {...field("brand_name")} label="Brand Name" placeholder="Enter brand name" />
              <RegField {...field("ingredient_name")} label="Ingredient Name" placeholder="Enter ingredient name" />
            </FormSection>

            <FormSection
              title="Account Details"
              subtitle="You'll sign in with your e-mail and this password once your account is approved."
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

            <FormSection
              title="Quality Documents"
              subtitle="Upload available quality and compliance documents for supplier verification. PDF, Word, JPG or PNG. Maximum file size 2 MB each."
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {QUALITY_DOCUMENTS.map((label, i) => {
                const name = documentField(i)
                const id = `reg-${name}`
                const file = documents[i]
                const error = errors[name]
                return (
                  <div
                    key={label}
                    className={`border rounded-xl p-4 min-w-0 ${error ? "border-red-300" : "border-[#e5e7eb]"}`}
                  >
                    <label htmlFor={id} className="block text-xs font-bold text-[#1e293b]">
                      {label}
                    </label>
                    <p className="text-[10px] text-[#94a3b8] mt-0.5 mb-3">{DOCUMENT_HINT}</p>
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor={id}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-[#0757a8] hover:bg-[#064985] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        <UploadIcon />
                        Upload
                      </label>
                      <input
                        id={id}
                        name={name}
                        type="file"
                        accept={DOCUMENT_ACCEPT}
                        className="sr-only"
                        onChange={(e) => {
                          setDocument(i, e.target.files?.[0] ?? null)
                          // Let the same file be picked again after removing it.
                          e.target.value = ""
                        }}
                      />
                      <span
                        className={`min-w-0 truncate text-[11px] ${file ? "font-semibold text-[#166534]" : "text-[#94a3b8]"}`}
                      >
                        {file?.name ?? "No file selected"}
                      </span>
                      {file && (
                        <button
                          type="button"
                          onClick={() => openLocalFile(file)}
                          className="ml-auto shrink-0 h-7 px-2.5 rounded-md border border-[#0757a8]/40 text-[11px] font-bold text-[#0757a8] hover:bg-[#eff6ff] transition-colors"
                        >
                          View
                        </button>
                      )}
                      {file && (
                        <button
                          type="button"
                          onClick={() => setDocument(i, null)}
                          aria-label={`Remove ${label}`}
                          className="shrink-0 text-[#94a3b8] hover:text-red-600 text-sm leading-none"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {error ? (
                      <p className="text-[11px] font-medium text-red-600 mt-2">{error}</p>
                    ) : (
                      file && (
                        <div className="flex items-center gap-1 text-[10px] text-[#166534] mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                          Ready to upload
                        </div>
                      )
                    )}
                  </div>
                )
              })}
            </FormSection>

            <FormSection title="Terms & Conditions">
              <AgreementField
                text="Agreed to terms and conditions of ingredientsbazar.com/Saisukrithkar Supplements Private Limited to place our ingredients on their platform."
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

export default SupplierForm
