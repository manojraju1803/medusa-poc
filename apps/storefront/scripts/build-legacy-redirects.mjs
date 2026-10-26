// Builds src/lib/legacy-redirects.json: every public URL of the old WordPress
// site (www.ingredientsbazar.com) mapped to its page on this storefront. The
// middleware answers those paths with a single 301.
//
// Source of old URLs: the WordPress (Yoast) sitemaps, i.e. everything the old
// site publishes. Product and category handles come from the Medusa store API
// so a mapping is only made to pages that exist.
//
//   node scripts/build-legacy-redirects.mjs
//
// Reads NEXT_PUBLIC_MEDUSA_BACKEND_URL and NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
// from .env. Fails if any old URL ends up without a destination.

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const OLD_SITE = "https://www.ingredientsbazar.com"
const OUT = path.join(ROOT, "src/lib/legacy-redirects.json")

const env = Object.fromEntries(
  fs
    .readFileSync(path.join(ROOT, ".env"), "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf("=")
      return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, "")]
    })
)
const BACKEND = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const KEY = env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

const get = async (url, opts = {}) => {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0", ...opts.headers } })
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return opts.json ? res.json() : res.text()
}
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())

// Lower-case, decoded, no trailing slash: how the middleware looks paths up.
export const normalizePath = (p) => {
  let out = decodeURIComponent(p).toLowerCase().replace(/\/+$/, "")
  return out || "/"
}

const words = (slug) =>
  slug
    .replace(/-?\d{6,}$/, "") // trailing HSN code
    .replace(/[-_]+/g, " ")
    .trim()
const search = (q) => `/search?q=${encodeURIComponent(q)}`

// ---------- current catalogue ----------
const storeAll = async (resource, fields) => {
  const items = []
  for (let offset = 0; ; offset += 100) {
    const r = await get(
      `${BACKEND}/store/${resource}?limit=100&offset=${offset}&fields=${fields}`,
      { json: true, headers: { "x-publishable-api-key": KEY } }
    )
    const page = r[resource === "product-categories" ? "product_categories" : resource]
    items.push(...page)
    if (offset + 100 >= r.count) return items
  }
}
const productHandles = new Set((await storeAll("products", "handle")).map((p) => p.handle))
const categoryHandles = new Set(
  (await storeAll("product-categories", "handle")).map((c) => c.handle)
)
const blogSlugs = new Set(
  [
    ...fs
      .readFileSync(path.join(ROOT, "src/modules/info-pages/lib/blog-posts.ts"), "utf8")
      .matchAll(/slug: "([^"]+)"/g),
  ].map((m) => m[1])
)
const partnerNames = [
  ...fs
    .readFileSync(path.join(ROOT, "src/modules/home/components/global-partners/partners.ts"), "utf8")
    .matchAll(/name: "([^"]+)"/g),
].map((m) => m[1])
const brandName = (slug) => {
  const key = slug.replace(/[^a-z0-9]/g, "")
  return partnerNames.find((n) => n.toLowerCase().replace(/[^a-z0-9]/g, "") === key) ?? words(slug)
}

// ---------- old pages that aren't products, categories or posts ----------
const PAGES = {
  "/shop": "/store",
  "/shop-2": "/store",
  "/all-products": "/store",
  "/shop-front": "/account",
  "/wishlist": "/account/wishlist",
  "/wishlist-2": "/account/wishlist",
  "/rigid-theme-blog": "/blog",
  "/our-blog": "/blog",
  "/order-tracking": "/account/orders",
  "/transaction": "/account/orders",
  "/wp-invoice": "/account/orders",
  "/terms-conditions": "/terms-and-conditions",
  "/terms-and-conditions": "/terms-and-conditions",
  "/privacy-policy": "/privacy-policy",
  "/returns": "/returns",
  "/faq": "/faq",
  "/about-us": "/about-us",
  "/saisukrithkar": "/about-us",
  "/documents": "/faq",
  "/delivery-information": "/delivery-information",
  "/user-defined-delivery-time": "/delivery-information",
  "/bulk-enquiry": "/bulk-enquiry",
  "/bulk-order": "/bulk-enquiry",
  "/promotions": "/promotions",
  "/product-development": "/product-development",
  "/ingredient-mela": "/deals",
  "/our-brands": "/suppliers",
  "/vendors-list": "/suppliers",
  "/wcmp": "/suppliers",
  "/wcmp-how-it-works": "/account?view=register&role=supplier",
  "/supplier-registration": "/account?view=register&role=supplier",
  "/vendor_dashboard": "/account",
  "/vendor_dashboard/product_orders": "/account",
  "/vendor_dashboard/shop_settings": "/account",
  "/vendor-announcements": "/account",
  "/contacts": "/contact",
  "/ticket_system": "/contact",
  "/cart": "/cart",
  "/checkout": "/cart",
  "/yith-compare": "/compare",
  "/register": "/account?view=register&role=buyer",
  "/password-reset": "/account?view=forgot-password",
  "/account": "/account",
  "/my-account": "/account",
  "/members": "/account",
  "/user": "/account",
  "/login": "/account",
  "/buyer-login": "/account",
  "/trader-login": "/account",
  "/individual-login": "/account",
  "/logout": "/",
  "/customer-logout": "/",
  "/sample-page": "/",
}

// ---------- map every old URL ----------
const index = locs(await get(`${OLD_SITE}/sitemap_index.xml`))
const map = {}
const unmapped = []
const counts = {}

for (const sitemap of index) {
  const type = path.basename(sitemap, ".xml").replace(/-sitemap\d*$/, "")
  const urls = locs(await get(sitemap)).filter(
    (u) => u.startsWith(OLD_SITE) && !u.includes("/wp-content/")
  )
  for (const url of urls) {
    const oldPath = normalizePath(new URL(url).pathname)
    if (oldPath === "/" || map[oldPath]) continue
    const parts = oldPath.split("/").filter(Boolean)
    let to = null

    if (PAGES[oldPath]) to = PAGES[oldPath]
    else if (parts[0] === "product" && parts[1])
      to = productHandles.has(parts[1]) ? `/products/${parts[1]}` : search(words(parts[1]))
    else if (parts[0] === "product-category") {
      const handle = parts[parts.length - 1]
      to = categoryHandles.has(handle) ? `/categories/${handle}` : "/store"
    } else if (parts[0] === "brands" && parts[1]) to = search(brandName(parts[1]))
    else if (parts[0] === "product-tag") to = "/store"
    else if (parts[0] === "brand") to = "/suppliers" // vendor shops
    else if (["category", "author", "portfolios-category"].includes(parts[0])) to = "/blog"
    else if (parts[0] === "portfolios")
      to = parts[1] && blogSlugs.has(parts[1]) ? `/blog/${parts[1]}` : "/blog"
    else if (type === "post" && parts.length === 1)
      to = blogSlugs.has(parts[0]) ? `/blog/${parts[0]}` : "/blog"

    if (!to) unmapped.push(oldPath)
    else {
      map[oldPath] = to
      counts[type] = (counts[type] ?? 0) + 1
    }
  }
}

if (unmapped.length) {
  console.error(`No destination for ${unmapped.length} old URL(s):\n  ${unmapped.join("\n  ")}`)
  process.exit(1)
}

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(OUT, JSON.stringify(sorted, null, 1) + "\n")
console.log(`Wrote ${Object.keys(sorted).length} redirects to ${path.relative(ROOT, OUT)}`)
console.log(Object.entries(counts).map(([t, n]) => `  ${t}: ${n}`).join("\n"))
