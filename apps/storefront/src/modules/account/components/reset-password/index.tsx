"use client"

import { useActionState, useState } from "react"

import { resetPassword } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { AuthError } from "../auth-field"
import { authInputClass } from "../login"

// Opened from the link in the password-reset e-mail.
const ResetPasswordForm = ({ token, email }: { token: string; email: string }) => {
  const [state, formAction, pending] = useActionState(resetPassword, null)
  const [show, setShow] = useState(false)

  if (!token || !email) {
    return (
      <Card>
        <h2 className="text-2xl font-extrabold text-[#0f172a]">Link incomplete</h2>
        <p className="text-sm text-[#64748b] mt-2">
          This reset link is missing information. Request a new one from the
          sign-in page.
        </p>
        <LinkButton href="/account?view=forgot-password">Request a new link</LinkButton>
      </Card>
    )
  }

  if (state?.state === "done") {
    return (
      <Card>
        <div role="status">
          <div className="w-12 h-12 rounded-full bg-[#ecf6dc] text-[#4d7c0f] flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-[#0f172a]">Password updated</h2>
          <p className="text-sm text-[#64748b] mt-2">
            You can now sign in to <strong className="text-[#0f172a]">{email}</strong> with
            your new password.
          </p>
        </div>
        <LinkButton href="/account">Go to sign in</LinkButton>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="text-2xl font-extrabold text-[#0f172a]">Set a new password</h2>
      <p className="text-sm text-[#64748b] mt-1">
        For <strong className="text-[#0f172a]">{email}</strong>. Use at least 8
        characters with a mix of letters and numbers.
      </p>
      <form action={formAction} className="space-y-4 mt-6">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />
        {/* Lets password managers save the new password against the account. */}
        <input type="hidden" name="username" autoComplete="username" value={email} />
        <div>
          <label htmlFor="reset-password" className="block text-xs font-semibold text-[#1e293b] mb-2">
            New password
          </label>
          <div className="relative flex items-center">
            <input
              id="reset-password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              required
              className={`${authInputClass} pr-14`}
              data-testid="new-password-input"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 text-[11px] font-semibold text-[#64748b] hover:text-[#0f172a]"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="reset-confirm" className="block text-xs font-semibold text-[#1e293b] mb-2">
            Confirm new password
          </label>
          <input
            id="reset-confirm"
            name="confirm_password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            required
            className={authInputClass}
            data-testid="confirm-password-input"
          />
        </div>
        <AuthError error={state?.state === "error" ? state.error : null} />
        <button
          type="submit"
          disabled={pending}
          className="w-full h-12 bg-[#4d7c0f] hover:bg-[#3f6212] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-70"
          data-testid="reset-password-button"
        >
          {pending ? "Saving…" : "Update password"}
        </button>
      </form>
      {state?.state === "error" && (
        <LocalizedClientLink
          href="/account?view=forgot-password"
          className="mt-4 block text-center text-sm font-semibold text-[#0077cf] hover:underline"
        >
          Request a new reset link
        </LocalizedClientLink>
      )}
    </Card>
  )
}

const Card = ({ children }: { children: React.ReactNode }) => (
  <section className="bg-white border border-white/20 rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,20,45,0.45)] text-[#0f172a]">
    <div className="h-1.5 bg-gradient-to-r from-[#7aba0c] via-[#3d996e] to-[#0077cf]" />
    <div className="p-6 sm:p-8">{children}</div>
  </section>
)

const LinkButton = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <LocalizedClientLink
    href={href}
    className="mt-6 flex items-center justify-center w-full h-12 bg-[#4d7c0f] hover:bg-[#3f6212] text-white text-sm font-bold rounded-lg transition-colors"
  >
    {children}
  </LocalizedClientLink>
)

export default ResetPasswordForm
