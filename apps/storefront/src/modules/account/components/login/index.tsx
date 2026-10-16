"use client"

import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { useActionState } from "react"
import AuthField, { AuthError, SubmitAuthButton } from "../auth-field"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction, pending] = useActionState(login, null)

  return (
    <div className="w-full" data-testid="login-page">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-7 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#0f172a] mb-1">
            Log in to your account
          </h1>
          <p className="text-sm text-[#64748b]">
            Approved buyers see live prices, slabs and stock.
          </p>
        </div>
        {message?.state === "verification_required" && (
          <div
            className="mb-5 text-sm text-[#0f172a] bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-3"
            data-testid="login-verification-message"
          >
            We sent a verification link to <strong>{message.email}</strong>.
            Please verify your email, then sign in.
          </div>
        )}
        <form action={formAction} className="space-y-4">
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
            label="Password"
            name="password"
            type="password"
            placeholder="Your password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
          <AuthError
            error={message?.state === "error" ? message.error : null}
          />
          <SubmitAuthButton
            pending={pending}
            pendingLabel="Signing in…"
            data-testid="sign-in-button"
          >
            Log In
          </SubmitAuthButton>
        </form>
      </div>
      <p className="text-center text-sm text-[#64748b] mt-5">
        New to Ingredients Bazar?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="text-[#006B4F] font-semibold hover:underline"
          data-testid="register-button"
        >
          Create an account
        </button>
      </p>
    </div>
  )
}

export default Login
