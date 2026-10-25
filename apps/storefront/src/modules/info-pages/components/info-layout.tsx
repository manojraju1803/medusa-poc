import React from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PageBanner from "@modules/suppliers/components/page-banner"

// Content pages linked from the footer. Copy comes from the matching pages on
// the original www.ingredientsbazar.com site (fetched 2026-10-19).
export const INFO_PAGES = [
  { label: "About Us", href: "/about-us" },
  { label: "Delivery Information", href: "/delivery-information" },
  { label: "FAQ", href: "/faq" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Bulk Enquiry", href: "/bulk-enquiry" },
  { label: "Promotions", href: "/promotions" },
  { label: "Returns", href: "/returns" },
  { label: "Product Development", href: "/product-development" },
  { label: "Our Blog", href: "/blog" },
]

export const InfoLayout = ({
  title,
  subtitle,
  current,
  children,
}: {
  title: string
  subtitle?: string
  current: string
  children: React.ReactNode
}) => (
  <div className="min-h-screen bg-[#fafdf5]">
    <PageBanner title={title} subtitle={subtitle} />
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-[230px_1fr] gap-6 items-start">
      <nav
        aria-label="Information pages"
        className="order-last lg:order-first lg:sticky lg:top-28 bg-white border border-[#e6f2d6] rounded-2xl p-3 shadow-sm"
      >
        <div className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
          Information
        </div>
        <ul>
          {INFO_PAGES.map((p) => {
            const active = p.href === current
            return (
              <li key={p.href}>
                <LocalizedClientLink
                  href={p.href}
                  aria-current={active ? "page" : undefined}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-[#4d7c0f] text-white font-semibold"
                      : "text-[#475569] hover:bg-[#f6fbee] hover:text-[#4d7c0f]"
                  }`}
                >
                  {p.label}
                </LocalizedClientLink>
              </li>
            )
          })}
        </ul>
      </nav>
      <article className="min-w-0 bg-white border border-[#e6f2d6] rounded-2xl shadow-sm p-5 sm:p-8">
        {children}
      </article>
    </div>
  </div>
)

export const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="flex items-center gap-2.5 text-lg sm:text-xl font-extrabold text-[#0f172a] mt-8 first:mt-0 mb-3">
    <span className="w-1.5 h-5 shrink-0 rounded-full bg-gradient-to-b from-[#7aba0c] to-[#0077cf]" aria-hidden="true" />
    {children}
  </h2>
)

export const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-base font-bold text-[#00356e] mt-5 mb-2">{children}</h3>
)

export const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm leading-relaxed text-[#475569] mb-3">{children}</p>
)

export const Checklist = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="space-y-2 mb-4">
    {items.map((item, i) => (
      <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-[#475569]">
        <span className="mt-0.5 w-4 h-4 shrink-0 rounded-full bg-[#7aba0c]/20 text-[#4d7c0f] flex items-center justify-center" aria-hidden="true">
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
)

export const Figure = ({
  src,
  alt,
  className = "",
}: {
  src: string
  alt: string
  className?: string
}) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={src}
    alt={alt}
    loading="lazy"
    className={`w-full rounded-xl border border-gray-100 object-cover ${className}`}
  />
)

export const Callout = ({ children }: { children: React.ReactNode }) => (
  <div className="my-5 rounded-xl border border-[#cfe5f4] bg-[#eaf5fc] px-4 py-3 text-sm leading-relaxed text-[#00356e]">
    {children}
  </div>
)

export const Mail = ({ to = "info@ingredientsbazar.com" }: { to?: string }) => (
  <a href={`mailto:${to}`} className="font-semibold text-[#0077cf] hover:underline">
    {to}
  </a>
)

export const Phone = () => (
  <a href="tel:+919035022477" className="font-semibold text-[#0077cf] hover:underline">
    +91 90350 22477
  </a>
)
