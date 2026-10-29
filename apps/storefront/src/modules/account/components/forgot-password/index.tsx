"use client"

import { useActionState } from "react"

import { requestPasswordReset } from "@lib/data/customer"
import { AuthError } from "../auth-field"
import { authInputClass } from "../login"

const ForgotPassword = ({ onBack }: { onBack: () => void }) => {
  const [state, formAction, pending] = useActionState(requestPasswordReset, null)

  return (
    <section
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
      data-testid="forgot-password-page"
    >
      <div className="h-1.5 bg-gradient-to-r from-[#4ade80] via-[#3d996e] to-[#0757a8]" />
      <div className="p-6 sm:p-7">
        {state?.state === "sent" ? (
          <div role="status">
            <div className="w-12 h-12 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.9 5.3a2 2 0 002.2 0L21 8m-2-3H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-[#0f172a]">Check your inbox</h2>
            <p className="text-sm text-[#64748b] mt-2 leading-relaxed">
              If an account exists for <strong className="text-[#0f172a]">{state.email}</strong>,
              we&apos;ve sent a link to reset your password. The link works once
              and expires in 15 minutes.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold text-[#0f172a]">Forgot password?</h2>
            <p className="text-sm text-[#64748b] mt-1">
              Enter the e-mail you registered with and we&apos;ll send you a reset link.
            </p>
            <form action={formAction} className="space-y-4 mt-5">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold text-[#1e293b] mb-2">
                  E-mail
                </label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  required
                  className={authInputClass}
                  data-testid="forgot-email-input"
                />
              </div>
              <AuthError error={state?.state === "error" ? state.error : null} />
              <button
                type="submit"
                disabled={pending}
                className="w-full h-12 bg-[#166534] hover:bg-[#14532d] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-70"
                data-testid="send-reset-link-button"
              >
                {pending ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )}
        <button
          type="button"
          onClick={onBack}
          className="mt-6 w-full text-center text-sm font-semibold text-[#0757a8] hover:underline"
          data-testid="back-to-sign-in"
        >
          ← Back to sign in
        </button>
      </div>
    </section>
  )
}

export default ForgotPassword
