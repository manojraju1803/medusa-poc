"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { getSearchSuggestions, SearchSuggestionProduct } from "@lib/data/search"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function HeaderSearch() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestionProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { countryCode } = useParams()

  // Debounced search when query changes (waiting briefly between keystrokes)
  useEffect(() => {
    const trimmed = query.trim()

    if (trimmed.length < 3) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timeoutId = setTimeout(async () => {
      try {
        const results = await getSearchSuggestions(trimmed, 8)
        setSuggestions(results)
      } catch (error) {
        console.error("Search failed:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 280)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Handle clicking outside to close suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Submit search: navigates to full results page
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    const trimmed = query.trim()
    if (!trimmed) return

    setIsOpen(false)
    inputRef.current?.blur()
    router.push(`/${countryCode}/store?q=${encodeURIComponent(trimmed)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit()
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const handleClear = () => {
    setQuery("")
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const showDropdown =
    isOpen && query.trim().length >= 3

  return (
    <div ref={containerRef} className="relative w-full" data-testid="header-search-container">
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        <div className="relative w-full">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ui-fg-muted">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (!isOpen) setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search ingredients, brands..."
            className="w-full pl-9 pr-16 py-1.5 text-sm bg-ui-bg-subtle-hover border border-ui-border-base rounded-full focus:outline-none focus:ring-1 focus:ring-ui-fg-base focus:border-ui-fg-base transition-colors placeholder:text-ui-fg-muted"
            data-testid="header-search-input"
            autoComplete="off"
            aria-label="Search products"
          />

          {/* Right Action Icons (Loading Spinner and Clear Button) */}
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
            {isLoading && (
              <svg
                className="animate-spin h-3.5 w-3.5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}

            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="text-ui-fg-muted hover:text-ui-fg-base p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Clear search"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div
          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-ui-border-base overflow-hidden z-50 transition-all max-h-96 overflow-y-auto"
          data-testid="search-suggestions-dropdown"
        >
          {suggestions.length > 0 ? (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-ui-fg-muted uppercase tracking-wider bg-gray-50 border-b border-ui-border-base">
                Product Suggestions ({suggestions.length})
              </div>
              <ul className="divide-y divide-gray-100">
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <LocalizedClientLink
                      href={`/products/${item.handle}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 transition-colors group cursor-pointer"
                      data-testid={`search-suggestion-item-${item.id}`}
                    >
                      {/* Product Thumbnail - No prices! */}
                      <div className="w-10 h-10 relative flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-100">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            sizes="40px"
                            className="object-cover object-center"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Product Name & Brand only (STRICTLY NO PRICE) */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </p>
                        {item.brand_name && (
                          <p className="text-xs text-gray-500 truncate">
                            {item.brand_name}
                          </p>
                        )}
                      </div>

                      {/* Subtle Arrow */}
                      <div className="text-gray-400 group-hover:text-gray-600">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>

              {/* Enter for full results footer */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="w-full text-left px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-xs font-medium text-blue-600 border-t border-gray-100 flex items-center justify-between transition-colors"
                data-testid="search-view-all-results-button"
              >
                <span>
                  View all results for &ldquo;
                  <span className="font-semibold">{query}</span>&rdquo;
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-2xs">
                  Enter ↵
                </span>
              </button>
            </div>
          ) : (
            !isLoading && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                <p>No products found matching &ldquo;{query}&rdquo;</p>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="mt-2 text-xs text-blue-600 hover:underline inline-block font-medium"
                >
                  Search all catalog &rarr;
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
