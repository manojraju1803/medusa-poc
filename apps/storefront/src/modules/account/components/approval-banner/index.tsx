"use client"

import { useSearchParams } from "next/navigation"

// Shown on the account pages until the team approves the customer. Right after
// registration (`?welcome=1`) it also confirms the account was created.
const ApprovalBanner = ({ approved }: { approved: boolean }) => {
  const searchParams = useSearchParams()
  const justCreated = searchParams.get("welcome") === "1"

  if (approved && !justCreated) return null

  return (
    <div
      className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${
        approved
          ? "border-[#bbf7d0] bg-[#f0fdf4]"
          : "border-amber-200 bg-amber-50"
      }`}
      data-testid="approval-banner"
    >
      <div
        className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${
          approved ? "bg-[#dcfce7] text-[#006B4F]" : "bg-amber-100 text-amber-700"
        }`}
      >
        {approved ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-[#0f172a]">
          {justCreated
            ? approved
              ? "Account created"
              : "Account created — pending approval"
            : "Your account is pending approval"}
        </p>
        <p className="text-xs text-[#64748b] mt-0.5">
          {approved
            ? "Your account is approved. Prices are unlocked."
            : "Prices unlock once our team approves you. You can browse the full catalogue meanwhile."}
        </p>
      </div>
    </div>
  )
}

export default ApprovalBanner
