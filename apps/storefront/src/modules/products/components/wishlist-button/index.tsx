"use client"

import { toggleWishlist } from "@lib/data/wishlist"
import { clx } from "@modules/common/components/ui"
import { useParams, useRouter } from "next/navigation"
import { useState, useTransition } from "react"

type Props = {
  productId: string
  initialSaved: boolean
  isLoggedIn: boolean
  size?: "sm" | "lg"
  // e.g. refresh the wishlist page after removing an item
  onChange?: (saved: boolean) => void
}

export default function WishlistButton({
  productId,
  initialSaved,
  isLoggedIn,
  size = "sm",
  onChange,
}: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) {
      router.push(`/${countryCode}/account`)
      return
    }
    const next = !saved
    setSaved(next)
    startTransition(async () => {
      const res = await toggleWishlist(productId)
      if (res.loggedOut) {
        router.push(`/${countryCode}/account`)
        return
      }
      const isSaved = res.wishlist.includes(productId)
      setSaved(isSaved)
      onChange?.(isSaved)
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      title={saved ? "Remove from wishlist" : "Add to wishlist"}
      data-testid="wishlist-button"
      className={clx(
        "flex items-center justify-center border transition-colors shrink-0",
        size === "lg" ? "w-10 h-10 rounded-xl" : "w-8 h-8 rounded-lg bg-white/90",
        saved
          ? "border-red-200 bg-red-50 text-red-500"
          : "border-gray-200 text-gray-400 hover:text-red-400"
      )}
    >
      <svg
        className={size === "lg" ? "w-5 h-5" : "w-4 h-4"}
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}
