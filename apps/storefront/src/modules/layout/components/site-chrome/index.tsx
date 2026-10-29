"use client"

import { usePathname, useRouter } from "next/navigation"

// The login/register page is a full-screen layout in the design: no site
// header, back row or footer while signed out, only a floating Back button.
export default function SiteChrome({
  loggedIn,
  floatingBack = false,
  children,
}: {
  loggedIn: boolean
  floatingBack?: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const onAuthPage = /^\/[^/]+\/account\/?$/.test(pathname)

  if (!onAuthPage || loggedIn) return <>{children}</>
  if (!floatingBack) return null

  return (
    <button
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
      className="fixed top-4 left-4 z-[60] inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-[#334155] hover:text-[#166534] text-xs font-semibold rounded-lg shadow-md"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  )
}
