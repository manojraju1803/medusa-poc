import Link from "next/link"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

// The 404 page body, in the site's colours. `localized` is false only for the
// top-level 404, which has no country code in its URL: its plain links are
// sent to the visitor's country by the middleware.
const NotFoundMessage = ({
  message = "The page you tried to access does not exist.",
  localized = true,
}: {
  message?: string
  localized?: boolean
}) => {
  const PageLink = localized ? LocalizedClientLink : Link

  return (
    <div className="bg-[#f8fffe] min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <div
        className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-sm py-14 px-6 text-center"
        data-testid="not-found"
      >
        <p className="text-6xl font-extrabold text-[#166534] leading-none mb-4">
          404
        </p>
        <h1 className="text-xl font-bold text-[#0f172a] mb-1">
          Page not found
        </h1>
        <p className="text-sm text-[#64748b] mb-6">{message}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <PageLink
            href="/"
            className="inline-block px-5 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-sm rounded-xl transition-colors"
          >
            Go to homepage
          </PageLink>
          <PageLink
            href="/store"
            className="inline-block px-5 py-2.5 border border-[#166534]/40 text-[#166534] hover:bg-[#f0fdf4] font-semibold text-sm rounded-xl transition-colors"
          >
            Browse Ingredients
          </PageLink>
        </div>
      </div>
    </div>
  )
}

export default NotFoundMessage
