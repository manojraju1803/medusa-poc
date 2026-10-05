import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const [collectionsRes, productCategories] = await Promise.all([
    listCollections({ fields: "*products" }).catch(() => ({ collections: [] })),
    listCategories().catch(() => []),
  ])
  const collections = collectionsRes.collections

  return (
    <footer className="bg-[#0A2540] text-[#e0f2fe] border-t border-[#1C94D2]/20 pt-16 pb-12">
      <div className="content-container flex flex-col w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <LocalizedClientLink href="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="IngredientsBazar - Next Generation Multi Brand Ingredients Platform"
                className="h-12 w-auto bg-white p-2 rounded-xl max-w-[240px] object-contain shadow-xs"
              />
            </LocalizedClientLink>
            <p className="text-xs text-[#bae6fd]/80 max-w-sm leading-relaxed">
              India's Next Generation Multi-Brand Ingredients Platform. Connecting global food, beverage, and nutraceutical manufacturers with verified raw material suppliers.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-[#97C93E]">
              <span>📍 Bengaluru, India</span>
              <span>•</span>
              <span>✉️ support@ingredientsbazar.com</span>
            </div>
          </div>

          {/* Sourcing Categories */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Raw Ingredients
            </span>
            <ul className="flex flex-col gap-2 text-xs text-[#bae6fd]/80">
              {productCategories?.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <LocalizedClientLink
                    className="hover:text-[#97C93E] transition-colors"
                    href={`/categories/${c.handle}`}
                  >
                    {c.name}
                  </LocalizedClientLink>
                </li>
              ))}
              <li>
                <LocalizedClientLink
                  className="hover:text-white font-semibold text-[#38bdf8]"
                  href="/store"
                >
                  View All Categories →
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Marketplace
            </span>
            <ul className="flex flex-col gap-2 text-xs text-[#bae6fd]/80">
              <li>
                <LocalizedClientLink className="hover:text-[#97C93E] transition-colors" href="/store">
                  Product Catalog
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink className="hover:text-[#97C93E] transition-colors" href="/account">
                  B2B Buyer Account
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink className="hover:text-[#97C93E] transition-colors" href="/cart">
                  Wholesale Cart
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink className="hover:text-[#97C93E] transition-colors" href="/account/orders">
                  Track Orders
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Compliance & Quality */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Compliance
            </span>
            <ul className="flex flex-col gap-2 text-xs text-[#bae6fd]/80">
              <li>✓ FSSAI Regulated</li>
              <li>✓ ISO 9001:2015 Standards</li>
              <li>✓ GMP Audited Suppliers</li>
              <li>✓ Halal & Kosher Traceability</li>
              <li>✓ Batch Lab CoAs Included</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[#bae6fd]/60 gap-4">
          <p>© {new Date().getFullYear()} IngredientsBazar Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-[#97C93E] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#97C93E] cursor-pointer">Terms of Sourcing</span>
            <span className="hover:text-[#97C93E] cursor-pointer">Quality Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
