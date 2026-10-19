"use client"

import { useActionState, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { CustomerAuthState, signup } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import AuthField, {
  AuthError,
  fieldClass,
  SubmitAuthButton,
} from "../auth-field"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

type AccountType = "buyer" | "supplier"

const ROLES: { key: AccountType; label: string; icon: string; desc: string }[] = [
  { key: "buyer", label: "Buyer", icon: "🛒", desc: "Source ingredients for my formulations" },
  { key: "supplier", label: "Supplier", icon: "🏭", desc: "List and sell my brand's ingredients" },
]

const BUYER_TYPES = [
  { key: "manufacturer", label: "Manufacturer" },
  { key: "trader", label: "Trader" },
  { key: "other", label: "Other" },
]

const Register = ({ setCurrentView }: Props) => {
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }
  const [accountType, setAccountType] = useState<AccountType>("buyer")
  const [buyerType, setBuyerType] = useState("manufacturer")

  const [message, formAction, pending] = useActionState(
    async (
      prev: CustomerAuthState,
      formData: FormData
    ): Promise<CustomerAuthState> => {
      if (formData.get("password") !== formData.get("confirm_password")) {
        return { state: "error", error: "Passwords do not match." }
      }
      const result = await signup(prev, formData)
      if (result?.state === "success") {
        router.push(`/${countryCode}/account?welcome=1`)
        router.refresh()
      }
      return result
    },
    null
  )

  if (message?.state === "success") {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-10 text-center">
        <div className="w-16 h-16 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-[#006B4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#0f172a] mb-2">
          Account created — pending approval
        </h2>
        <p className="text-sm text-[#64748b]">
          Prices unlock once our team approves you.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full" data-testid="register-page">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-7 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#0f172a] mb-1">
            Create Your Account
          </h1>
          <p className="text-sm text-[#64748b]">
            Join Ingredients Bazar — free for buyers and suppliers
          </p>
        </div>

        {message?.state === "verification_required" && (
          <div
            className="mb-5 text-sm text-[#0f172a] bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-3"
            data-testid="register-verification-message"
          >
            We sent a verification link to <strong>{message.email}</strong>.
            Please verify your email, then sign in. Prices unlock once our
            team approves you.
          </div>
        )}

        <div className="mb-6">
          <span className="block text-xs font-bold text-[#374151] uppercase tracking-wider mb-2.5">
            I am a
          </span>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((opt) => {
              const active = accountType === opt.key
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setAccountType(opt.key)}
                  className={`relative flex flex-col items-start p-4 border-2 rounded-xl text-left transition-all ${
                    active
                      ? "border-[#006B4F] bg-[#f0fdf4]"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  data-testid={`account-type-${opt.key}`}
                >
                  {active && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-[#006B4F] rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <span className="text-xl mb-1.5" aria-hidden="true">
                    {opt.icon}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      active ? "text-[#006B4F]" : "text-[#0f172a]"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-[#9ca3af] leading-snug mt-0.5">
                    {opt.desc}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <form action={formAction} className="space-y-3">
          <input type="hidden" name="account_type" value={accountType} />
          <div className="grid grid-cols-2 gap-3">
            <AuthField
              label="First Name"
              name="first_name"
              placeholder="John"
              autoComplete="given-name"
              required
              data-testid="first-name-input"
            />
            <AuthField
              label="Last Name"
              name="last_name"
              placeholder="Doe"
              autoComplete="family-name"
              required
              data-testid="last-name-input"
            />
          </div>
          <AuthField
            label="Work Email"
            name="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <AuthField
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="+91 98765 43210"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <AuthField
            label="Company Name"
            name="company_name"
            placeholder="Your company"
            autoComplete="organization"
            required
            data-testid="company-input"
          />

          {accountType === "buyer" ? (
            <div>
              <span className="block text-xs font-semibold text-[#374151] mb-1.5">
                Buyer Type
              </span>
              <input type="hidden" name="buyer_type" value={buyerType} />
              <div className="grid grid-cols-3 gap-2">
                {BUYER_TYPES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setBuyerType(t.key)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      buyerType === t.key
                        ? "border-[#006B4F] bg-[#f0fdf4] text-[#006B4F]"
                        : "border-gray-200 text-[#374151] hover:border-gray-300"
                    }`}
                    data-testid={`buyer-type-${t.key}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <AuthField
                  label="Brand Name"
                  name="brand_name"
                  placeholder="Your brand"
                  required
                  data-testid="brand-input"
                />
                <AuthField
                  label="Country"
                  name="country"
                  placeholder="India"
                  defaultValue="India"
                  autoComplete="country-name"
                  required
                  data-testid="country-input"
                />
              </div>
              <div>
                <label
                  htmlFor="product_categories"
                  className="block text-xs font-semibold text-[#374151] mb-1.5"
                >
                  Product Categories
                </label>
                <textarea
                  id="product_categories"
                  name="product_categories"
                  rows={2}
                  placeholder="e.g. Dairy, Proteins, Sweeteners"
                  className={`${fieldClass} resize-none`}
                  data-testid="categories-input"
                />
              </div>
            </>
          )}

          <AuthField
            label="Password"
            name="password"
            type="password"
            placeholder="8+ characters"
            autoComplete="new-password"
            minLength={8}
            required
            data-testid="password-input"
          />
          <AuthField
            label="Confirm Password"
            name="confirm_password"
            type="password"
            placeholder="Re-enter password"
            autoComplete="new-password"
            minLength={8}
            required
            data-testid="confirm-password-input"
          />

          <label className="flex items-start gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              name="terms"
              required
              className="mt-0.5 w-4 h-4 accent-[#006B4F]"
              data-testid="terms-checkbox"
            />
            <span className="text-xs text-[#64748b] leading-relaxed">
              I agree to Ingredients Bazar&apos;s{" "}
              <a href="#" className="text-[#006B4F] underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-[#006B4F] underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>

          <AuthError
            error={message?.state === "error" ? message.error : null}
          />
          <div className="pt-2">
            <SubmitAuthButton
              pending={pending}
              pendingLabel="Creating account…"
              data-testid="register-button"
            >
              Create Account — It&apos;s Free
            </SubmitAuthButton>
          </div>
        </form>
      </div>
      <p className="text-center text-sm text-[#64748b] mt-5">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="text-[#006B4F] font-semibold hover:underline"
          data-testid="sign-in-link"
        >
          Log In
        </button>
      </p>
    </div>
  )
}

export default Register
