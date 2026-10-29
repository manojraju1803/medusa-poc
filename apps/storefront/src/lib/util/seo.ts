import { Metadata } from "next"

import { getBaseURL } from "./env"

export const SITE_NAME = "Ingredients Bazar"

export const SITE_TAGLINE = "Bulk Food Ingredients from Verified Suppliers"

export const SITE_DESCRIPTION =
  "Bulk food ingredients - dairy, sweeteners, flavours, extracts, proteins and more - from verified suppliers, for manufacturers and traders across India."

// For private pages: account, cart, checkout, orders, invoices, auth flows.
export const NOINDEX: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
}

// app/opengraph-image.png (also app/twitter-image.png).
const DEFAULT_SOCIAL_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} - ${SITE_TAGLINE}`,
}

export const absoluteUrl = (path: string) =>
  new URL(path, getBaseURL()).toString()

// "/about-us" -> "/in/about-us"; "" or "/" -> "/in"
export const localizedPath = (countryCode: string, path = "") =>
  `/${countryCode}${path === "/" ? "" : path}`

type PageMetadataInput = {
  countryCode: string
  // The path after the country code, e.g. "/products/abc". "" for the home page.
  path: string
  // A plain string goes through the root layout's "%s | Ingredients Bazar" template.
  title: string | { absolute: string }
  description: string
  images?: { url: string; alt?: string }[]
  noindex?: boolean
}

/**
 * Title, description, canonical URL and Open Graph / Twitter tags for a page.
 * Without `images` the site-wide share image is used.
 */
export const pageMetadata = ({
  countryCode,
  path,
  title,
  description,
  images,
  noindex,
}: PageMetadataInput): Metadata => {
  // A canonical URL on a noindex page sends search engines mixed signals.
  if (noindex) {
    return { title, description, robots: NOINDEX }
  }

  const url = absoluteUrl(localizedPath(countryCode, path))
  const socialTitle =
    typeof title === "string" ? `${title} | ${SITE_NAME}` : title.absolute
  // A page that sets its own openGraph loses the root opengraph-image.png, so
  // fall back to it explicitly.
  const socialImages = images?.length ? images : [DEFAULT_SOCIAL_IMAGE]

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: socialImages,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: socialImages,
    },
  }
}

type CountryParams = { params: Promise<{ countryCode: string }> }

/** `export const generateMetadata = staticPageMetadata({...})` for fixed-content pages. */
export const staticPageMetadata =
  (input: Omit<PageMetadataInput, "countryCode">) =>
  async (props: CountryParams): Promise<Metadata> => {
    const { countryCode } = await props.params
    return pageMetadata({ ...input, countryCode })
  }

// Plain text from product/category HTML descriptions, trimmed for meta tags.
export const toMetaDescription = (
  html: string | null | undefined,
  max = 160
): string => {
  const text = (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()

  if (text.length <= max) {
    return text
  }

  const cut = text.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length)}…`
}

// Serialises JSON-LD for a <script> tag; "<" is escaped so content can't close it.
export const jsonLd = (data: unknown) => ({
  __html: JSON.stringify(data).replace(/</g, "\\u003c"),
})
