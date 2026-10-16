"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { SearchIcon } from "../ib-icons"

const HeaderSearch = ({
  className = "",
  onSubmitted,
}: {
  className?: string
  onSubmitted?: () => void
}) => {
  const [value, setValue] = useState("")
  const router = useRouter()
  const { countryCode } = useParams()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    router.push(`/${countryCode}/search?q=${encodeURIComponent(q)}`)
    onSubmitted?.()
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className={`flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#006B4F] focus-within:bg-white transition-all ${className}`}
    >
      <SearchIcon className="w-4 h-4 text-gray-400 ml-3 shrink-0" />
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search ingredients…"
        aria-label="Search ingredients"
        className="flex-1 min-w-0 px-3 py-2 text-sm outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
      />
      <button
        type="submit"
        className="px-3 py-2 text-xs font-semibold text-[#006B4F] hover:bg-[#f0fdf4]"
      >
        Search
      </button>
    </form>
  )
}

export default HeaderSearch
