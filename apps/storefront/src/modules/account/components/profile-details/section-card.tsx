"use client"

import { startTransition, useActionState, useEffect, useState } from "react"

import { ProfileSaveState, updateProfileSection } from "@lib/data/profile"
import {
  AccountRole,
  BUSINESS_NATURES,
  COMPANY_NATURES,
  FIELD_LABELS,
  FieldErrors,
  FormValues,
  INDIAN_STATES,
  isRequired,
  ProfileSection,
  validateFields,
} from "@lib/util/registration"
import RegField from "../register/reg-field"

type InputConfig = Partial<React.ComponentProps<typeof RegField>>

// How each field is edited; mirrors the registration forms.
const INPUTS: Record<string, InputConfig> = {
  company_name: { autoComplete: "organization" },
  company_nature: { options: COMPANY_NATURES },
  business_nature: { options: BUSINESS_NATURES },
  state: { options: INDIAN_STATES },
  registered_address: { textarea: true, maxLength: 300 },
  warehouse_address: { textarea: true, maxLength: 300 },
  contact_address: { textarea: true, maxLength: 300 },
  city: { maxLength: 60 },
  postcode: { inputMode: "numeric", maxLength: 6, digitsOnly: true },
  gst_number: { maxLength: 15, placeholder: "22AAAAA0000A1Z5" },
  fssai_number: { inputMode: "numeric", maxLength: 14, digitsOnly: true },
  contact_person: { maxLength: 100, autoComplete: "name" },
  mobile: { type: "tel", inputMode: "numeric", maxLength: 10, digitsOnly: true },
  telephone: { type: "tel", inputMode: "numeric", maxLength: 12, digitsOnly: true },
}

const WIDE = ["registered_address", "warehouse_address", "contact_address"]

export const ProfileCard = ({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}) => (
  <section className="rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden">
    <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 bg-[#f8fffe] border-b border-[#e5e7eb]">
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#0757a8]">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-xs text-[#64748b]">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="p-5 sm:p-6">{children}</div>
  </section>
)

export const ghostButton =
  "shrink-0 h-9 px-4 inline-flex items-center rounded-lg border border-[#cbd5e1] bg-white text-xs font-bold text-[#334155] hover:border-[#0757a8] hover:text-[#0757a8] transition-colors"
export const primaryButton =
  "h-10 px-6 inline-flex items-center justify-center rounded-lg bg-[#166534] hover:bg-[#14532d] disabled:opacity-70 text-white text-sm font-bold transition-colors"

const SectionCard = ({
  role,
  section,
  initial,
}: {
  role: AccountRole
  section: ProfileSection
  initial: FormValues
}) => {
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState<FormValues>(initial)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [state, dispatch, pending] = useActionState<ProfileSaveState, FormData>(
    updateProfileSection,
    null
  )

  // Fresh server data after a save (or someone else's edit) resets the form.
  useEffect(() => {
    if (!editing) setValues(initial)
  }, [initial, editing])

  useEffect(() => {
    if (state?.state === "saved") {
      setEditing(false)
      setErrors({})
    } else if (state?.state === "error") {
      setErrors(state.fieldErrors ?? {})
    }
  }, [state])

  const setValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const found = validateFields(role, values, section.fields)
    setErrors(found)
    if (Object.keys(found).length) return
    const formData = new FormData()
    formData.set("section", section.key)
    for (const field of section.fields) formData.set(field, values[field] ?? "")
    startTransition(() => dispatch(formData))
  }

  const cancel = () => {
    setValues(initial)
    setErrors({})
    setEditing(false)
  }

  const savedJustNow = state?.state === "saved" && !editing

  return (
    <ProfileCard
      title={section.title}
      subtitle={section.subtitle}
      action={
        !editing && (
          <button type="button" onClick={() => setEditing(true)} className={ghostButton}>
            Edit
          </button>
        )
      }
    >
      {editing ? (
        <form onSubmit={save} noValidate>
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
            {section.fields.map((field) => (
              <div key={field} className={WIDE.includes(field) ? "md:col-span-2" : ""}>
                <RegField
                  {...INPUTS[field]}
                  name={field}
                  label={FIELD_LABELS[field] ?? field}
                  value={values[field] ?? ""}
                  onChange={setValue}
                  error={errors[field]}
                  required={isRequired(role, field)}
                />
              </div>
            ))}
          </div>
          {state?.state === "error" && !state.fieldErrors && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {state.error}
            </p>
          )}
          <div className="flex flex-wrap gap-3 mt-6">
            <button type="submit" disabled={pending} className={primaryButton}>
              {pending ? "Saving…" : "Save changes"}
            </button>
            <button type="button" onClick={cancel} disabled={pending} className={ghostButton + " h-10"}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            {section.fields.map((field) => (
              <div key={field} className={`min-w-0 ${WIDE.includes(field) ? "sm:col-span-2" : ""}`}>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                  {FIELD_LABELS[field] ?? field}
                </dt>
                <dd className={`mt-0.5 text-sm break-words ${initial[field] ? "text-[#0f172a]" : "text-[#94a3b8] italic"}`}>
                  {initial[field] || "Not provided"}
                </dd>
              </div>
            ))}
          </dl>
          {savedJustNow && (
            <p role="status" className="mt-4 text-xs font-semibold text-[#166534]">
              Saved.
            </p>
          )}
        </>
      )}
    </ProfileCard>
  )
}

export default SectionCard
