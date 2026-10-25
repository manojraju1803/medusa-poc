"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import type { NavMenuGroup } from "../../lib/menu-categories"
import { NAV_LINKS } from "../nav-links"

export type MenuCategory = {
  id: string
  name: string
  handle: string
  children: { id: string; name: string; handle: string }[]
}

const Chevron = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

type MenuKey = "nutra" | "food" | "agro"

const linkClass =
  "px-3 py-2 text-sm font-medium text-[#374151] hover:text-[#4d7c0f] hover:bg-[#f6fbee] rounded-lg transition-all"

// Desktop nav: Home, Nutra, Food, Agro, Supplier, Deal of Month, Contact Us.
const MegaMenu = ({
  nutra,
  food,
  agro,
}: {
  nutra: NavMenuGroup[]
  food: NavMenuGroup[]
  agro: NavMenuGroup[]
}) => {
  const [open, setOpen] = useState<MenuKey | null>(null)
  const ref = useRef<HTMLElement>(null)
  const pathname = usePathname()

  useEffect(() => setOpen(null), [pathname])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      const header = ref.current?.closest("header")
      if (header && !header.contains(e.target as Node)) setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null)
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const toggleBtn = (key: MenuKey, label: string) => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => (o === key ? null : key))}
        aria-expanded={open === key}
        aria-haspopup="menu"
        data-testid={`nav-${key}-button`}
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
          open === key
            ? "text-[#4d7c0f] bg-[#f6fbee]"
            : "text-[#374151] hover:text-[#4d7c0f] hover:bg-[#f6fbee]"
        }`}
      >
        {label} <Chevron />
      </button>
    </div>
  )

  const menus: Record<MenuKey, { label: string; groups: NavMenuGroup[] }> = {
    nutra: { label: "Nutra", groups: nutra },
    food: { label: "Food", groups: food },
    agro: { label: "Agro", groups: agro },
  }
  const { label, groups } = menus[open ?? "nutra"]

  return (
    <nav ref={ref} className="hidden lg:flex items-center">
      <LocalizedClientLink href="/" className={linkClass}>
        Home
      </LocalizedClientLink>
      {toggleBtn("nutra", "Nutra")}
      {toggleBtn("food", "Food")}
      {toggleBtn("agro", "Agro")}
      {NAV_LINKS.map((link) =>
        link.label === "Deal of Month" ? (
          <LocalizedClientLink
            key={link.label}
            href={link.href}
            className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            {link.label}
          </LocalizedClientLink>
        ) : (
          <LocalizedClientLink key={link.label} href={link.href} className={linkClass}>
            {link.label}
          </LocalizedClientLink>
        )
      )}

      {open && (
        <div
          role="menu"
          aria-label={`${label} categories`}
          className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 border-b shadow-xl z-50 max-h-[calc(100vh-5rem)] overflow-y-auto"
        >
          <div className="max-w-[1440px] mx-auto px-7 py-6 relative">
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label={`Close ${label} menu`}
              className="absolute top-3 right-5 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#4d7c0f] hover:bg-[#f6fbee]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10 pr-8">
              {groups.map((group) => (
                <div key={group.title}>
                  <div className="w-full text-left text-sm font-bold uppercase tracking-wider text-[#0077cf] pb-2 mb-1 border-b border-gray-200 relative after:absolute after:left-0 after:-bottom-px after:w-6 after:h-0.5 after:bg-lime-500">
                    {group.title}
                  </div>
                  <div className="pt-1">
                    {group.items.map((item) => (
                      <div key={item.label} className="py-1">
                        <LocalizedClientLink
                          href={item.href}
                          onClick={() => setOpen(null)}
                          className="block w-full text-left text-xs font-semibold text-[#0077cf] hover:text-[#4d7c0f]"
                        >
                          {item.label}
                        </LocalizedClientLink>
                        <LocalizedClientLink
                          href={item.href}
                          onClick={() => setOpen(null)}
                          className="w-full flex items-center justify-between pl-2 pt-0.5 text-[11px] font-semibold text-[#0077cf] hover:text-[#4d7c0f]"
                        >
                          <span className="before:content-['-'] before:mr-1 before:text-gray-300">
                            Product List
                          </span>
                          <span>›</span>
                        </LocalizedClientLink>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default MegaMenu
