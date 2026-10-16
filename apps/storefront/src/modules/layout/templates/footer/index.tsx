import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { LeafIcon } from "@modules/layout/components/ib-icons"
import { getMenuCategories } from "@modules/layout/lib/menu-categories"

const INFORMATION_LINKS = [
  "About Us",
  "Delivery Information",
  "FAQ",
  "Terms & Conditions",
  "Privacy Policy",
  "Returns",
]

const QUICK_LINKS = [
  { label: "All Products", href: "/store" },
  { label: "Our Brands", href: "/suppliers" },
  { label: "Compare Ingredients", href: "/compare" },
  { label: "My Account", href: "/account" },
  { label: "Contact", href: "/contact" },
]

const FooterHeading = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-5">
    <div className="text-sm font-bold text-white uppercase tracking-wider">
      {children}
    </div>
    <div className="w-10 h-0.5 bg-[#4ade80] mt-2" />
  </div>
)

const linkClass =
  "text-left text-xs text-white/70 hover:text-[#86efac] transition-colors"

export default async function Footer() {
  const categories = (await getMenuCategories()).slice(0, 7)

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

      <div className="relative max-w-[1440px] mx-auto px-6 pt-14 pb-10">
        <div className="flex items-center gap-3 pb-8 mb-9 border-b border-white/15">
          <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
            <LeafIcon className="w-5 h-5 text-[#86efac]" />
          </div>
          <div>
            <LocalizedClientLink href="/" className="text-xl font-extrabold tracking-tight">
              Ingredients Bazar
            </LocalizedClientLink>
            <p className="text-[10px] text-white/60 mt-1">
              Premium B2B ingredient sourcing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div>
            <FooterHeading>Information</FooterHeading>
            <ul className="space-y-2.5">
              {INFORMATION_LINKS.map((label) => (
                <li key={label}>
                  <a href="#" className={linkClass}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterHeading>Quick Links</FooterHeading>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <LocalizedClientLink href={l.href} className={linkClass}>
                    {l.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {categories.length > 0 && (
            <div>
              <FooterHeading>Categories</FooterHeading>
              <ul className="space-y-2.5" data-testid="footer-categories">
                {categories.map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      href={`/categories/${c.handle}`}
                      className={linkClass}
                      data-testid="category-link"
                    >
                      {c.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <FooterHeading>Customer Care</FooterHeading>
            <div className="space-y-4 text-xs text-white/80">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                  Warehouse
                </div>
                <div className="mt-0.5">Bangalore, Karnataka</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                  Enquiries
                </div>
                <LocalizedClientLink
                  href="/contact"
                  className="mt-0.5 inline-block hover:text-[#86efac] transition-colors"
                >
                  Send us a message →
                </LocalizedClientLink>
              </div>
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
          </div>
        </div>
      </div>

      <div className="relative bg-[#06152b]/65 border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {["LinkedIn", "Facebook", "Instagram", "X"].map((label) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="h-8 px-2.5 flex items-center justify-center rounded-lg bg-white/10 text-[11px] font-semibold text-white/70 hover:bg-[#4ade80] hover:text-[#052e16] transition-colors"
              >
                {label === "LinkedIn" ? "in" : label === "Facebook" ? "f" : label === "Instagram" ? "ig" : "X"}
              </a>
            ))}
          </div>
          <p className="text-xs text-white/60 text-center sm:text-right">
            © {new Date().getFullYear()} Ingredients Bazar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
