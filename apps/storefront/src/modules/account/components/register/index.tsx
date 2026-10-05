"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div
      className="w-full flex flex-col"
      data-testid="register-page"
    >
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a]">
          Register Business Account
        </h1>
        <p className="text-xs text-[#64748b] mt-1">
          Create your verified IngredientsBazar buyer profile for direct manufacturer pricing and GST invoicing.
        </p>
      </div>

      {message?.state === "verification_required" && (
        <div
          className="w-full mb-4 text-xs text-[#166534] bg-[#dcfce7] border border-[#bbf7d0] rounded-xl p-3.5"
          data-testid="register-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please check your inbox to verify your email, then sign in.
        </div>
      )}

      <form className="w-full flex flex-col gap-y-3" action={formAction}>
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
          label="Work Email"
          name="email"
          required
          type="email"
          autoComplete="email"
          data-testid="email-input"
        />
        <Input
          label="Contact Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          data-testid="phone-input"
        />
        <Input
          label="Password (min 8 chars)"
          name="password"
          required
          type="password"
          autoComplete="new-password"
          data-testid="password-input"
        />

        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="register-error"
        />

        <span className="text-[11px] text-[#64748b] mt-2">
          By registering, you agree to IngredientsBazar&apos;s{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="text-[#1C94D2] underline font-medium"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="text-[#1C94D2] underline font-medium"
          >
            Terms of Wholesale Trade
          </LocalizedClientLink>
          .
        </span>

        <SubmitButton
          className="w-full mt-2 h-11 bg-[#1C94D2] hover:bg-[#0284c7] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          data-testid="register-button"
        >
          Complete B2B Registration →
        </SubmitButton>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#64748b]">
        <span>Already have an account?</span>
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="font-bold text-[#1C94D2] hover:underline"
        >
          Sign In Here →
        </button>
      </div>
    </div>
  )
}

export default Register
