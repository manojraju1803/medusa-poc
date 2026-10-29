"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

import { recordPage } from "@lib/util/in-app-history"

// The sign-in / register page is a full-screen layout: no site header, back
// row or footer while signed out. Its logo links home.
export default function SiteChrome({
  loggedIn,
  children,
}: {
  loggedIn: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const onAuthPage = /^\/[^/]+\/account\/?$/.test(pathname)

  // Always mounted (around the header, back row and footer), so it records
  // every page change for the Back buttons.
  useEffect(() => {
    recordPage(pathname)
  }, [pathname])

  return !onAuthPage || loggedIn ? <>{children}</> : null
}
