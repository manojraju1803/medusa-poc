import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { LeafIcon } from "@modules/layout/components/ib-icons"

const linkClass =
  "text-left text-xs text-white/70 hover:text-[#86efac] transition-colors"

const INFORMATION_LINKS = [
  { label: "About Us", href: "#" },
  { label: "Delivery Information", href: "#" },
  { label: "FAQ", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Bulk Enquiry", href: "/contact" },
  { label: "Promotions", href: "/deals" },
]

const EXTRAS_LINKS = [
  { label: "Transaction", href: "/account/orders" },
  { label: "Our Brands", href: "/suppliers" },
  { label: "Returns", href: "#" },
  { label: "Product Development", href: "/contact" },
  { label: "Contact", href: "/contact" },
  { label: "Our Blog", href: "#" },
  { label: "Deal of Month", href: "/deals" },
]

const CARE = [
  {
    label: "Business Hours",
    value: "Mon–Sat, 9AM–6PM IST",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    label: "Warehouse",
    value: "Bangalore, Karnataka",
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.7 16.7L13.4 21a2 2 0 01-2.8 0l-4.3-4.3a8 8 0 1111.4 0z" />
        <circle cx="12" cy="11" r="3" strokeWidth={2} />
      </>
    ),
  },
  {
    label: "Phone",
    value: "+91 90350 22477",
    href: "tel:+919035022477",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.3a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.25 1.13a11 11 0 005.5 5.5l1.13-2.26a1 1 0 011.2-.49l4.49 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.7 21 3 14.3 3 6V5z" />,
  },
  {
    label: "Email",
    value: "sales@ingredientsbazar.com",
    href: "mailto:sales@ingredientsbazar.com",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.9 5.3a2 2 0 002.2 0L21 8m-2-3H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z" />,
  },
]

const SOCIALS = [
  { label: "LinkedIn", path: <path d="M6.5 8.5H3.3V19h3.2V8.5zM4.9 3.2A1.9 1.9 0 104.9 7a1.9 1.9 0 000-3.8zM19 13c0-3.2-1.7-4.7-4-4.7-1.8 0-2.7 1-3.1 1.7V8.5H8.7V19h3.2v-5.2c0-1.4.3-2.8 2.1-2.8 1.8 0 1.8 1.7 1.8 2.9V19H19v-6z" /> },
  { label: "Facebook", path: <path d="M14 8h3V4.2c-.5-.1-2.2-.2-4.1-.2C9 4 6.4 6.4 6.4 10.8V14H3v4.3h3.4V29H11V18.3h3.8l.6-4.3H11v-2.8C11 10 11.3 8 14 8z" transform="scale(.75)" /> },
  { label: "Instagram", path: <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1" /></> },
  { label: "X", path: <path d="M4 4l6.7 8.9L4.4 20H7l4.9-5.5L16 20h4l-6.2-8.3L20.6 4H18l-5.4 6.1L8 4H4z" /> },
]

const FooterLinks = ({ links }: { links: { label: string; href: string }[] }) => (
  <ul className="space-y-2.5">
    {links.map((l) => (
      <li key={l.label}>
        {l.href === "#" ? (
          <a href="#" className={linkClass}>{l.label}</a>
        ) : (
          <LocalizedClientLink href={l.href} className={linkClass}>{l.label}</LocalizedClientLink>
        )}
      </li>
    ))}
  </ul>
)

const FooterHeading = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-5">
    <div className="text-sm font-bold text-white uppercase tracking-wider">
      {children}
    </div>
    <div className="w-10 h-0.5 bg-[#4ade80] mt-2" />
  </div>
)


export default function Footer() {

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#087f5b] via-[#075e54] to-[#081d3a] text-white font-sans">
      <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1440 520"
          preserveAspectRatio="none"
        >
          <path d="M0 310C220 230 390 390 620 310C860 225 1030 360 1440 180V520H0Z" fill="none" stroke="white" strokeWidth="1.5" />
          <path d="M0 360C260 270 430 430 700 340C960 250 1160 330 1440 230" fill="none" stroke="#4ade80" strokeWidth="1" />
          <path d="M-40 170C250 70 480 250 760 150C1050 45 1240 140 1500 60" fill="none" stroke="white" strokeWidth="0.8" />
          <circle cx="1160" cy="110" r="170" fill="none" stroke="white" strokeWidth="0.6" />
          <circle cx="1160" cy="110" r="220" fill="none" stroke="#4ade80" strokeWidth="0.6" />
        </svg>
      </div>

      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 pt-14 pb-10">
        <div className="flex items-center gap-3 pb-8 mb-9 border-b border-white/15">
          <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
            <LeafIcon className="w-5 h-5 text-[#86efac]" />
          </div>
          <div>
            <LocalizedClientLink href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Ingredients Bazar" className="h-8 w-auto object-contain brightness-0 invert" />
            </LocalizedClientLink>
            <p className="text-[10px] text-white/60 mt-1">Premium B2B ingredient sourcing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div>
            <FooterHeading>Information</FooterHeading>
            <FooterLinks links={INFORMATION_LINKS} />
          </div>

          <div>
            <FooterHeading>Extras</FooterHeading>
            <FooterLinks links={EXTRAS_LINKS} />
          </div>

          <div>
            <FooterHeading>Customer Care</FooterHeading>
            <div className="space-y-4">
              {CARE.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-[#86efac]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="text-xs text-white/80 hover:text-[#86efac] transition-colors break-words">{item.value}</a>
                    ) : (
                      <div className="text-xs leading-relaxed text-white/80">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <FooterHeading>Payment Options</FooterHeading>
            <p className="text-xs leading-relaxed text-white/65 mb-5">
              Secure bank transfer options for verified B2B orders.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {["RTGS", "NEFT"].map((method) => (
                <div
                  key={method}
                  className="bg-white/10 border border-white/15 rounded-xl p-4 text-center"
                >
                  <svg className="w-5 h-5 text-[#86efac] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M5 6h14l2 4H3l2-4zm0 4v8m4-8v8m6-8v8m4-8v8M3 18h18v3H3v-3z" />
                  </svg>
                  <div className="text-xs font-bold text-white">{method}</div>
                </div>
              ))}
            </div>
            <LocalizedClientLink
              href="/contact"
              className="block w-full mt-4 py-2.5 border border-[#86efac]/40 text-[#86efac] hover:bg-white/10 text-xs font-bold rounded-xl transition-colors text-center"
            >
              Payment Assistance
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      <div className="relative bg-[#06152b]/65 border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href="#"
                aria-label={social.label}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-[#4ade80] hover:text-[#052e16] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">{social.path}</svg>
              </a>
            ))}
          </div>
          <p className="text-xs text-white/60 text-center sm:text-right">
            ingredientsbazar.com | © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
