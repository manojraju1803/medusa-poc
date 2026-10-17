"use client"

import { usePathname, useRouter } from "next/navigation"

// Back row under the header on every page except home (original design).
const BackButton = () => {
  const router = useRouter()
  const pathname = usePathname()

  if (pathname.split("/").filter(Boolean).length <= 1) return null

  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-12 pt-3">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-[#334155] hover:border-[#006B4F]/40 hover:text-[#006B4F] text-xs font-semibold rounded-lg shadow-sm transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    </div>
  )
}

export default BackButton
