"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { getSearchSuggestions, SearchSuggestionProduct } from "@lib/data/search"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SearchIcon } from "../ib-icons"

export type HeaderSearchProps = {
  className?: string
  onSubmitted?: () => void
}

export default function HeaderSearch({
  className = "",
  onSubmitted,
}: HeaderSearchProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestionProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { countryCode } = useParams()
  const latestQueryRef = useRef(query)
  latestQueryRef.current = query

  // Debounced search when query changes
  useEffect(() => {
    const trimmed = query.trim()

    if (trimmed.length < 3) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    let isCurrent = true
    setIsLoading(true)

    const timeoutId = setTimeout(async () => {
      try {
        const results = await getSearchSuggestions(trimmed, 8)
        if (!isCurrent || latestQueryRef.current.trim() !== trimmed) {
          return
        }
        setSuggestions(results)
      } catch (error) {
        if (!isCurrent || latestQueryRef.current.trim() !== trimmed) {
          return
        }
        console.error("Search failed:", error)
        setSuggestions([])
      } finally {
        if (isCurrent && latestQueryRef.current.trim() === trimmed) {
          setIsLoading(false)
        }
      }
    }, 280)

    return () => {
      isCurrent = false
      clearTimeout(timeoutId)
    }
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

  // Submit search: navigates to full search results page
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    const trimmed = query.trim()
    if (!trimmed) return

    setIsOpen(false)
    inputRef.current?.blur()
    router.push(`/${countryCode}/search?q=${encodeURIComponent(trimmed)}`)
    onSubmitted?.()
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

  const showDropdown = isOpen && query.trim().length >= 3

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      data-testid="header-search-container"
    >
      <form
        role="search"
        onSubmit={handleSubmit}
        className="relative flex items-center w-full"
      >
        <div className="relative w-full flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#006B4F] focus-within:bg-white transition-all">
          {/* Search Icon */}
          <div className="pl-3 flex items-center pointer-events-none text-gray-400 shrink-0">
            <SearchIcon className="w-4 h-4 text-gray-400" />
          </div>

          {/* Search Input */}
          <input
            ref={inputRef}
            type="search"
            name="q"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (!isOpen) setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search ingredients…"
            className="flex-1 min-w-0 pl-3 pr-10 py-2 text-sm bg-transparent outline-none placeholder:text-gray-400 text-gray-700"
            data-testid="header-search-input"
            autoComplete="off"
            aria-label="Search ingredients"
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

            {query && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
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
          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 transition-all max-h-96 overflow-y-auto"
          data-testid="search-suggestions-dropdown"
        >
          {suggestions.length > 0 ? (
            <div>
              <div className="px-3.5 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/80 border-b border-gray-100">
                Product Suggestions ({suggestions.length})
              </div>
              <ul className="divide-y divide-gray-100">
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <LocalizedClientLink
                      href={`/products/${item.handle}`}
                      onClick={() => {
                        setIsOpen(false)
                        onSubmitted?.()
                      }}
                      className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-[#f0fdf4] transition-colors group cursor-pointer"
                      data-testid={`search-suggestion-item-${item.id}`}
                    >
                      {/* Product Thumbnail - No prices! */}
                      <div className="w-9 h-9 relative shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            sizes="36px"
                            className="object-cover object-center"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <SearchIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Name & Brand only (STRICTLY NO PRICE) */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-[#006B4F] transition-colors">
                          {item.title}
                        </p>
                        {item.brand_name && (
                          <p className="text-[10px] text-gray-500 truncate">
                            {item.brand_name}
                          </p>
                        )}
                      </div>

                      {/* Subtle Arrow */}
                      <div className="text-gray-400 group-hover:text-[#006B4F] transition-colors">
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
                className="w-full text-left px-3.5 py-2.5 bg-gray-50 hover:bg-[#f0fdf4] text-xs font-semibold text-[#006B4F] border-t border-gray-100 flex items-center justify-between transition-colors"
                data-testid="search-view-all-results-button"
              >
                <span>
                  View all results for &ldquo;
                  <span className="font-bold">{query}</span>&rdquo;
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
                  className="mt-2 text-xs text-[#006B4F] hover:underline inline-block font-semibold"
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
