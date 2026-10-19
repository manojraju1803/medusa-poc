"use client"

import { readCompare, useCompareList, writeCompare } from "@modules/products/lib/compare-store"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

// The compare list lives in localStorage; the server renders whatever ids are
// in the URL, so keep `?ids=` in step with the stored list.
export default function CompareSync({ urlIds }: { urlIds: string[] }) {
  const ids = useCompareList()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const stored = readCompare()
    if (stored.join(",") !== urlIds.join(",")) {
      router.replace(
        stored.length ? `${pathname}?ids=${stored.join(",")}` : pathname,
        { scroll: false }
      )
    }
  }, [ids, urlIds, pathname, router])

  return null
}

export function CompareRemove({ productId }: { productId: string }) {
  return (
    <button
      type="button"
      onClick={() => writeCompare(readCompare().filter((id) => id !== productId))}
      className="text-[11px] text-[#64748b] hover:text-red-500"
    >
      Remove
    </button>
  )
}

export function CompareClear() {
  return (
    <button
      type="button"
      onClick={() => writeCompare([])}
      className="text-xs font-semibold text-[#64748b] hover:text-red-500"
    >
      Clear all
    </button>
  )
}
