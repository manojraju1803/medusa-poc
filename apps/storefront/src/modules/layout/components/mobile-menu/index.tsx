"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import HeaderSearch from "../header-search"
import { ChevronDownIcon, CloseIcon, MenuIcon } from "../ib-icons"
import { MenuCategory } from "../mega-menu"
import { NAV_LINKS } from "../nav-links"

const MobileMenu = ({
  categories,
  isLoggedIn,
}: {
  categories: MenuCategory[]
  isLoggedIn: boolean
}) => {
  const [open, setOpen] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  const close = () => setOpen(false)

  const links = [
    { label: "Home", href: "/" },
    ...NAV_LINKS,
    { label: "Wishlist", href: "/account/wishlist" },
    { label: "Compare", href: "/compare" },
    { label: "Cart", href: "/cart" },
    { label: isLoggedIn ? "My Account" : "Sign Up / Login", href: "/account" },
  ]

  return (
    <>
      <button
        type="button"
        className="lg:hidden p-2 text-gray-500 ml-1"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        data-testid="nav-menu-button"
      >
        {open ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
      </button>

      {open && (
        <div
          data-testid="nav-menu-popup"
          className="lg:hidden absolute top-full left-0 right-0 border-t border-gray-100 bg-white px-4 pb-4 shadow-lg max-h-[calc(100vh-7rem)] overflow-y-auto z-50"
        >
          <HeaderSearch className="mt-3 mb-3" onSubmitted={close} />
          <ul>
            {links.slice(0, 1).map((l) => (
              <li key={l.label}>
                <LocalizedClientLink
                  href={l.href}
                  onClick={close}
                  className="block w-full px-2 py-3 text-sm font-medium text-[#374151] border-b border-gray-50 hover:text-[#006B4F]"
                >
                  {l.label}
                </LocalizedClientLink>
              </li>
            ))}
            {categories.length > 0 && (
              <li className="border-b border-gray-50">
                <button
                  type="button"
                  onClick={() => setCatsOpen((o) => !o)}
                  aria-expanded={catsOpen}
                  className="w-full flex items-center justify-between px-2 py-3 text-sm font-medium text-[#374151] hover:text-[#006B4F]"
                >
                  Categories
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${catsOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {catsOpen && (
                  <ul className="grid grid-cols-2 gap-x-3 pb-3 pl-2">
                    {categories.map((c) => (
                      <li key={c.id}>
                        <LocalizedClientLink
                          href={`/categories/${c.handle}`}
                          onClick={close}
                          className="block py-1.5 text-xs font-semibold text-[#0757a8] hover:text-[#006B4F]"
                        >
                          {c.name}
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}
            {links.slice(1).map((l) => (
              <li key={l.label}>
                <LocalizedClientLink
                  href={l.href}
                  onClick={close}
                  className="block w-full px-2 py-3 text-sm font-medium text-[#374151] border-b border-gray-50 hover:text-[#006B4F]"
                >
                  {l.label}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export default MobileMenu
