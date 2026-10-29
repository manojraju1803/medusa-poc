"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState } from "react"

// Server-rendered pages give no feedback between a click and the next page
// arriving. This bar starts on the click itself and finishes when the URL
// changes. A route-level loading.tsx would do the same, but it makes notFound()
// answer 200 (a "soft 404"), so the product and category routes avoid it.
const ProgressBar = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState<number | null>(null)
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }
      const anchor = (event.target as Element | null)?.closest?.("a")
      if (!anchor || !anchor.href || anchor.target === "_blank") return
      if (anchor.hasAttribute("download")) return

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      // Same page, or only a hash change: nothing will load.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return
      }

      clearTimers()
      setProgress(15)
      timers.current.push(
        window.setTimeout(() => setProgress(45), 150),
        window.setTimeout(() => setProgress(70), 700),
        window.setTimeout(() => setProgress(85), 2000),
        // Never stay stuck if the navigation is abandoned.
        window.setTimeout(() => setProgress(null), 15000)
      )
    }

    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [])

  // The new URL has rendered: finish the bar, then hide it.
  useEffect(() => {
    clearTimers()
    setProgress((current) => (current === null ? null : 100))
    const id = window.setTimeout(() => setProgress(null), 250)
    return () => window.clearTimeout(id)
  }, [pathname, searchParams])

  if (progress === null) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none"
      role="progressbar"
      aria-label="Loading page"
      aria-valuenow={progress}
    >
      <div
        className="h-full bg-[#4ade80] shadow-[0_0_8px_#4ade80] transition-[width] duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

const NavigationProgress = () => (
  <Suspense fallback={null}>
    <ProgressBar />
  </Suspense>
)

export default NavigationProgress
