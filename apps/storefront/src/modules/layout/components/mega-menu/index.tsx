"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ChevronDownIcon, CloseIcon } from "../ib-icons"

export type MenuCategory = {
  id: string
  name: string
  handle: string
  children: { id: string; name: string; handle: string }[]
}

const MAX_CHILDREN = 6

const MegaMenu = ({ categories }: { categories: MenuCategory[] }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  if (!categories.length) return null

  return (
    <div ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        data-testid="nav-categories-button"
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
          open
            ? "text-[#006B4F] bg-[#f0fdf4]"
            : "text-[#374151] hover:text-[#006B4F] hover:bg-[#f0fdf4]"
        }`}
      >
        Categories
        <ChevronDownIcon
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Product categories"
          className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 border-b shadow-xl z-50 max-h-[calc(100vh-8rem)] overflow-y-auto"
        >
          <div className="max-w-[1440px] mx-auto px-7 py-6 relative">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close categories menu"
              className="absolute top-3 right-5 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#006B4F] hover:bg-[#f0fdf4]"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-6 pr-8">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <LocalizedClientLink
                    href={`/categories/${cat.handle}`}
                    onClick={() => setOpen(false)}
                    className="block w-full text-left text-sm font-bold uppercase tracking-wider text-[#0757a8] hover:text-[#006B4F] pb-2 mb-1 border-b border-gray-200 relative after:absolute after:left-0 after:-bottom-px after:w-6 after:h-0.5 after:bg-lime-500"
                  >
                    {cat.name}
                  </LocalizedClientLink>
                  <ul className="pt-1">
                    {cat.children.slice(0, MAX_CHILDREN).map((child) => (
                      <li key={child.id} className="py-0.5">
                        <LocalizedClientLink
                          href={`/categories/${child.handle}`}
                          onClick={() => setOpen(false)}
                          className="block text-xs font-semibold text-[#0098d8] hover:text-[#006B4F]"
                        >
                          {child.name}
                        </LocalizedClientLink>
                      </li>
                    ))}
                    {(cat.children.length > MAX_CHILDREN ||
                      cat.children.length === 0) && (
                      <li className="pt-1">
                        <LocalizedClientLink
                          href={`/categories/${cat.handle}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between text-[11px] font-semibold text-[#173b96] hover:text-[#006B4F]"
                        >
                          <span>
                            {cat.children.length > MAX_CHILDREN
                              ? `View all ${cat.children.length}`
                              : "Product list"}
                          </span>
                          <span>›</span>
                        </LocalizedClientLink>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MegaMenu
