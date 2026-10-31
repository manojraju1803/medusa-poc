import { MetadataRoute } from "next"

import { listRegions } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"

// Private pages (also noindex on the page itself), plus per-viewer pages with
// no content of their own (search results, compare).
const DISALLOWED_ROUTES = [
  "account",
  "cart",
  "checkout",
  "invoice",
  "order",
  "reset-password",
  "verify-account",
  "compare",
  "search",
]

const countryCodes = async (): Promise<string[]> => {
  const regions = await listRegions().catch(() => [])
  const codes = regions
    .flatMap((r) => r.countries?.map((c) => c.iso_2) ?? [])
    .filter((c): c is string => !!c)
  return codes.length ? Array.from(new Set(codes)) : ["in"]
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = getBaseURL()

  // Demo and dev deployments stay out of search results; only the real
  // production site sets ALLOW_INDEXING=true.
  if (process.env.ALLOW_INDEXING !== "true") {
    return { rules: [{ userAgent: "*", disallow: "/" }] }
  }

  // Every page lives under "/<country code>/". The codes are spelled out rather
  // than written as "/*/cart", since "*" also spans slashes and would block
  // e.g. "/in/products/carthamus-...".
  const disallow = (await countryCodes()).flatMap((cc) =>
    DISALLOWED_ROUTES.map((route) => `/${cc}/${route}`)
  )

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...disallow, "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
