import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import CategoryGrid from "@modules/home/components/category-grid"
import B2bWorkflow from "@modules/home/components/b2b-workflow"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

import { getBaseURL } from "@lib/util/env"

export const metadata: Metadata = {
  title: "IngredientsBazar — Next Generation Multi-Brand Natural Ingredients Platform",
  description:
    "India's premier online multi-brand natural ingredients platform. Direct B2B raw material procurement for food, beverage, botanical, dairy, and nutraceutical manufacturing with verified CoAs.",
  keywords: [
    "natural ingredients",
    "botanical extracts",
    "bulk raw materials",
    "food ingredients India",
    "nutraceutical ingredients",
    "WPC 80 Meggle",
    "curcumin extract 95%",
    "B2B raw material procurement",
    "IngredientsBazar",
  ],
  alternates: {
    canonical: `${getBaseURL()}/in`,
  },
  openGraph: {
    title: "IngredientsBazar — Next Generation Multi-Brand Natural Ingredients Platform",
    description:
      "Direct B2B raw material procurement for food, botanical, dairy, and nutraceutical manufacturers. Sourced from 50+ audited global and Indian brands with batch lab CoAs.",
    url: `${getBaseURL()}/in`,
    siteName: "IngredientsBazar",
    type: "website",
    images: [
      {
        url: `${getBaseURL()}/opengraph-image.jpg`,
        width: 1200,
        height: 630,
        alt: "IngredientsBazar - Next Generation Multi-Brand Ingredients Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IngredientsBazar — Multi-Brand Natural Ingredients Platform",
    description:
      "Direct industrial procurement for 100% pure botanical extracts, plant proteins, and certified raw materials.",
    images: [`${getBaseURL()}/twitter-image.jpg`],
  },
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const region = await getRegion(countryCode)
  const baseUrl = getBaseURL()

  const { collections } = await listCollections({
    fields: "id, handle, title",
  }).catch(() => ({ collections: [] }))

  if (!region) {
    return null
  }

  // JSON-LD Structured Data for Google Rich Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "IngredientsBazar",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo.png`,
          width: "295",
          height: "70",
        },
        description:
          "India's next generation multi-brand natural ingredients platform connecting industrial food, beverage, and nutraceutical manufacturers with verified raw material suppliers.",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "support@ingredientsbazar.com",
          areaServed: "IN",
          availableLanguage: ["English", "Hindi"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "IngredientsBazar",
        description:
          "Direct B2B procurement platform for verified food, beverage, dairy and nutraceutical ingredients.",
        publisher: {
          "@id": `${baseUrl}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/${countryCode}/store?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  }

  return (
    <div className="flex flex-col w-full bg-white">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Browse by Category Grid */}
      <CategoryGrid />

      {/* 3. Featured Ingredients Catalog */}
      {collections && collections.length > 0 && (
        <section className="py-16 bg-white border-b border-gray-200">
          <div className="content-container">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1C94D2] mb-1 block">
                  Top Industrial Sourcing
                </span>
                <h2 className="text-2xl lg:text-3xl font-bold text-[#0f172a]">
                  Featured Raw Materials
                </h2>
                <p className="text-sm text-[#6b7280] mt-1">
                  Ready-to-ship inventory with verified Certificate of Analysis (CoA)
                </p>
              </div>
            </div>

            <ul className="flex flex-col gap-y-12">
              <FeaturedProducts collections={collections} region={region} />
            </ul>
          </div>
        </section>
      )}

      {/* 4. B2B Sourcing Process & Compliance Strip */}
      <B2bWorkflow />
    </div>
  )
}
