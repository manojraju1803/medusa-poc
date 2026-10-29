"use client"

import { useActionState } from "react"

import { sendMyPasswordReset } from "@lib/data/profile"
import { ghostButton, ProfileCard } from "./section-card"

// Sign-in details. The e-mail is the login, so it's shown read-only.
const SecurityCard = ({ email }: { email: string }) => {
  const [state, formAction, pending] = useActionState(sendMyPasswordReset, null)

  return (
    <ProfileCard title="Sign-in & Security">
      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
        <div className="min-w-0">
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">E-mail (sign-in)</dt>
          <dd className="mt-0.5 text-sm text-[#0f172a] break-words">{email}</dd>
          <dd className="mt-1 text-[11px] text-[#94a3b8]">
            To change your sign-in e-mail, contact sales@ingredientsbazar.com.
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Password</dt>
          <dd className="mt-0.5 text-sm text-[#0f172a]">••••••••</dd>
          <dd className="mt-2">
            {state?.state === "sent" ? (
              <span role="status" className="text-xs font-semibold text-[#166534]">
                Reset link sent to {state.email}. It expires in 15 minutes.
              </span>
            ) : (
              <form action={formAction}>
                <button type="submit" disabled={pending} className={ghostButton}>
                  {pending ? "Sending…" : "Change password"}
                </button>
                {state?.state === "error" && (
                  <p role="alert" className="mt-2 text-xs text-red-600">{state.error}</p>
                )}
              </form>
            )}
          </dd>
        </div>
      </dl>
    </ProfileCard>
  )
}

export default SecurityCard
