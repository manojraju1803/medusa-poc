"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import HeaderSearch from "../header-search"
import { CloseIcon, MenuIcon } from "../ib-icons"

const MobileMenu = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  const close = () => setOpen(false)

  const links = [
    { label: "Home", href: "/" },
    { label: "Nutraceuticals", href: "/store" },
    { label: "Food Ingredients", href: "/store" },
    { label: "Supplier Directory", href: "/suppliers" },
    { label: "Deal of Month", href: "/deals" },
    { label: "Contact Us", href: "/contact" },
    ...(isLoggedIn
      ? [
          { label: "My Orders", href: "/account/orders" },
          { label: "My Cart", href: "/cart" },
          { label: "Compare", href: "/compare" },
          { label: "Wishlist", href: "/account/wishlist" },
          { label: "My Account", href: "/account" },
        ]
      : []),
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
            {links.map((l) => (
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
