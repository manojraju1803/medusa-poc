"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { hasEarlierPage } from "@lib/util/in-app-history"

// Back appears only on pages you drill into from a list, where returning to
// that list is the natural next step. Pages reached from the header, menu or
// footer don't get one: the navigation is already on screen.
// `fallback` is where Back goes when there's no earlier page on this site
// (opened from a search engine, a shared link or a new tab).
const BACK_ROUTES: { match: RegExp; fallback: string }[] = [
  { match: /^\/[^/]+\/products\/[^/]+\/?$/, fallback: "/store" },
  { match: /^\/[^/]+\/categories\/.+/, fallback: "/store" },
  { match: /^\/[^/]+\/collections\/[^/]+\/?$/, fallback: "/suppliers" },
  { match: /^\/[^/]+\/compare\/?$/, fallback: "/store" },
]

const BackButton = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { countryCode } = useParams() as { countryCode?: string }

  const route = BACK_ROUTES.find((r) => r.match.test(pathname))
  if (!route) return null

  const goBack = () => {
    if (hasEarlierPage()) router.back()
    else router.push(`/${countryCode ?? ""}${route.fallback}`)
  }

  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 pt-3">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-[#334155] hover:border-[#4d7c0f]/40 hover:text-[#4d7c0f] text-xs font-semibold rounded-lg shadow-sm transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    </div>
  )
}

export default BackButton
