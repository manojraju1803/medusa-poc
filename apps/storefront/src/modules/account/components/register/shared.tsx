"use client"

import { ACCOUNT_ROLES, AccountRole, ROLE_LABEL } from "@lib/util/registration"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const AgreementField = ({
  text,
  value,
  onChange,
  error,
}: {
  text: string
  value: string
  onChange: (name: string, value: string) => void
  error?: string
}) => (
  <fieldset>
    <legend className="text-xs sm:text-sm font-bold text-[#0f172a] leading-relaxed uppercase">
      {text}
    </legend>
    <div className="flex items-center gap-6 mt-4">
      {["yes", "no"].map((opt) => (
        <label key={opt} className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="agreement"
            value={opt}
            checked={value === opt}
            onChange={() => onChange("agreement", opt)}
            aria-invalid={!!error || undefined}
            className="w-4 h-4 accent-[#0077cf]"
          />
          <span className="text-sm font-semibold text-[#1e293b] capitalize">{opt}</span>
        </label>
      ))}
    </div>
    {error && <p className="text-[11px] font-medium text-red-600 mt-2">{error}</p>}
  </fieldset>
)

export const FormAlert = ({ children }: { children: React.ReactNode }) => (
  <div
    role="alert"
    className="border border-red-200 bg-red-50 rounded-xl px-4 py-3 text-xs font-medium text-red-700"
    data-testid="register-error"
  >
    {children}
  </div>
)

export const VerificationNotice = ({ email }: { email: string }) => (
  <div
    role="status"
    className="max-w-lg mx-auto text-center px-5 sm:px-8 py-12"
    data-testid="register-verification-message"
  >
    <div className="w-14 h-14 bg-[#ecf6dc] rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-7 h-7 text-[#4d7c0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h2 className="text-xl font-extrabold text-[#0f172a]">Registration submitted</h2>
    <p className="text-sm text-[#64748b] mt-2 leading-relaxed">
      We sent a verification link to <strong className="text-[#0f172a]">{email}</strong>.
      Verify your e-mail, then sign in. Our team reviews new accounts within
      24–48 hours.
    </p>
  </div>
)

// Same banner for every role; the photo is what tells them apart.
export const RegisterBanner = ({
  title,
  subtitle,
  image,
}: {
  title: string
  subtitle: string
  image: string
}) => (
  // Fixed height so every role's banner (and photo) is the same size,
  // whatever the subtitle length.
  <section className="relative overflow-hidden bg-[#00254d] text-white h-[340px] sm:h-[380px]">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-br from-[#00254d]/[.92] via-[#00356e]/[.82] to-[#2f5d1a]/[.75]" />
    <div className="relative h-full max-w-[900px] mx-auto px-4 sm:px-6 pt-12 pb-24 flex flex-col items-center justify-center text-center">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-semibold tracking-wider text-white/75"
      >
        <LocalizedClientLink href="/" className="hover:text-white">
          HOME
        </LocalizedClientLink>
        <span>/</span>
        <span className="text-white">REGISTER</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-wide mt-4 text-balance">
        {title}
      </h1>
      <p className="max-w-2xl mx-auto text-sm sm:text-base text-white/80 leading-relaxed mt-3 line-clamp-3">
        {subtitle}
      </p>
    </div>
  </section>
)

const ROLE_HINT: Record<AccountRole, string> = {
  buyer: "Source ingredients for manufacturing",
  rnd: "Research and develop new products",
  supplier: "List and sell your ingredients",
}

// Buyer / R&D / Supplier switch at the top of the registration form card.
export const RoleTabs = ({
  role,
  onChange,
}: {
  role: AccountRole
  onChange: (role: AccountRole) => void
}) => (
  <div className="px-5 sm:px-8 pt-6 pb-5">
    <div className="text-center text-[11px] font-bold uppercase tracking-widest text-[#64748b] mb-3">
      I am registering as
    </div>
    <div
      role="radiogroup"
      aria-label="Account type"
      className="grid grid-cols-3 gap-2 sm:gap-3 max-w-2xl mx-auto"
    >
      {ACCOUNT_ROLES.map((r) => {
        const active = r === role
        return (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(r)}
            className={`relative text-center rounded-xl px-2 sm:px-4 py-2.5 sm:py-3 border-2 transition-colors ${
              active
                ? "bg-white border-[#0077cf] shadow-[0_6px_16px_rgba(0,119,207,0.15)]"
                : "bg-white border-[#dbe3ec] hover:border-[#0077cf]/40"
            }`}
            data-testid={`register-role-${r}`}
          >
            {active && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#0077cf] text-white flex items-center justify-center" aria-hidden="true">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
            <span className={`block text-sm font-extrabold ${active ? "text-[#0077cf]" : "text-[#0f172a]"}`}>
              {ROLE_LABEL[r]}
            </span>
            <span className="hidden sm:block text-[11px] leading-snug mt-0.5 text-[#64748b]">
              {ROLE_HINT[r]}
            </span>
          </button>
        )
      })}
    </div>
  </div>
)

// One header style for every part of the registration forms.
export const FormSection = ({
  title,
  subtitle,
  className = "",
  children,
}: {
  title: string
  subtitle?: React.ReactNode
  className?: string
  children: React.ReactNode
}) => (
  <section className="border-t border-[#dbe3ec]">
    <div className="px-5 sm:px-8 py-4 bg-[#f8fbff] border-b border-[#dbe3ec]">
      <h2 className="text-base font-extrabold uppercase tracking-wide text-[#0077cf]">
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-xs text-[#64748b]">{subtitle}</p>}
    </div>
    <div className={`p-5 sm:p-8 ${className}`}>{children}</div>
  </section>
)

export const PRIMARY_BUTTON =
  "h-12 px-8 inline-flex items-center justify-center bg-[#4d7c0f] hover:bg-[#3f6212] disabled:opacity-70 text-white text-sm font-bold rounded-lg transition-colors"

export const SECONDARY_BUTTON =
  "h-12 px-8 inline-flex items-center justify-center bg-white border border-[#cbd5e1] hover:border-[#0077cf] hover:text-[#0077cf] text-[#334155] text-sm font-bold rounded-lg transition-colors"

// Register / Login row at the end of every registration form.
export const FormActions = ({
  pending,
  onSignIn,
}: {
  pending: boolean
  onSignIn: () => void
}) => (
  <div className="flex flex-col sm:flex-row gap-3 mt-7">
    <button
      type="submit"
      disabled={pending}
      className={`${PRIMARY_BUTTON} sm:min-w-[200px]`}
      data-testid="register-button"
    >
      {pending ? "Registering…" : "Register"}
    </button>
    <button
      type="button"
      onClick={onSignIn}
      className={SECONDARY_BUTTON}
      data-testid="sign-in-link"
    >
      Already registered? Log in
    </button>
  </div>
)
