import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="w-full flex flex-col"
      data-testid="login-page"
    >
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a]">
          Sign In to Procurement Account
        </h1>
        <p className="text-xs text-[#64748b] mt-1">
          Access your commercial order history, live wholesale pricing, and tax invoices.
        </p>
      </div>

      {message?.state === "verification_required" && (
        <div
          className="w-full mb-6 text-xs text-[#166534] bg-[#dcfce7] border border-[#bbf7d0] rounded-xl p-3.5"
          data-testid="login-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please verify your email, then sign in.
        </div>
      )}

      <form className="w-full flex flex-col gap-y-3" action={formAction}>
        <Input
          label="Work Email Address"
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="email"
          required
          data-testid="email-input"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          data-testid="password-input"
        />

        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="login-error-message"
        />

        <SubmitButton
          data-testid="sign-in-button"
          className="w-full mt-2 h-11 bg-[#1C94D2] hover:bg-[#0284c7] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
        >
          Sign In to B2B Account →
        </SubmitButton>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#64748b]">
        <span>New wholesale buyer?</span>
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="font-bold text-[#1C94D2] hover:underline"
          data-testid="register-button"
        >
          Register Business Account →
        </button>
      </div>
    </div>
  )
}

export default Login
