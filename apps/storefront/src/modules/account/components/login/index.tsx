"use client"

import { useActionState, useState } from "react"

import { login } from "@lib/data/customer"
import { AuthError } from "../auth-field"

type Props = {
  onRegister: () => void
  onForgotPassword: () => void
}

export const authInputClass =
  "w-full h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-sm text-[#0f172a] outline-none focus:border-[#0077cf] focus:ring-2 focus:ring-[#0077cf]/15"

const Login = ({ onRegister, onForgotPassword }: Props) => {
  const [message, formAction, pending] = useActionState(login, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <section
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
      data-testid="login-page"
    >
      <div className="h-1.5 bg-gradient-to-r from-[#7aba0c] via-[#3d996e] to-[#0077cf]" />
      <div className="p-6 sm:p-7">
        <h2 className="text-2xl font-extrabold text-[#0f172a]">Sign in</h2>
        <p className="text-sm text-[#64748b] mt-1">
          Buyers, R&amp;D teams and suppliers all sign in here.
        </p>

        {message?.state === "verification_required" && (
          <div
            className="mt-5 text-xs text-[#0f172a] bg-[#f6fbee] border border-[#d9edb8] rounded-lg p-3"
            data-testid="login-verification-message"
          >
            We sent a verification link to <strong>{message.email}</strong>.
            Please verify your e-mail, then sign in.
          </div>
        )}

        <form action={formAction} className="space-y-4 mt-5">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-[#1e293b] mb-2">
              E-mail
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              required
              className={authInputClass}
              data-testid="email-input"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="login-password" className="text-xs font-semibold text-[#1e293b]">
                Password
              </label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs font-semibold text-[#0077cf] hover:underline"
                data-testid="forgot-password-link"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className={`${authInputClass} pr-14`}
                data-testid="password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 text-[11px] font-semibold text-[#64748b] hover:text-[#0f172a]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <AuthError error={message?.state === "error" ? message.error : null} />
          <button
            type="submit"
            disabled={pending}
            className="w-full h-12 bg-[#4d7c0f] hover:bg-[#3f6212] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-70"
            data-testid="sign-in-button"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-gray-100" />
          <span className="text-[10px] text-[#94a3b8] uppercase font-bold">New to Ingredients Bazar?</span>
          <div className="h-px flex-1 bg-gray-100" />
        </div>
        <button
          type="button"
          onClick={onRegister}
          className="w-full h-11 border border-[#0077cf]/40 text-[#0077cf] hover:bg-[#eaf5fc] text-sm font-bold rounded-lg transition-colors"
          data-testid="register-button"
        >
          Create an account
        </button>
        <p className="mt-3 text-center text-[11px] text-[#94a3b8]">
          Register as a Buyer, R&amp;D professional or Supplier.
        </p>
      </div>
    </section>
  )
}

export default Login
