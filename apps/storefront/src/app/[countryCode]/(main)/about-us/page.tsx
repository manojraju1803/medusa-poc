import { staticPageMetadata } from "@lib/util/seo"

import {
  Checklist,
  Figure,
  H2,
  InfoLayout,
  P,
} from "@modules/info-pages/components/info-layout"

export const generateMetadata = staticPageMetadata({
  path: "/about-us",
  title: "About Us",
  description:
    "SaiSukrithkar Supplements Private Limited, the company behind Ingredients Bazar: multi-brand food and nutra ingredients under one umbrella.",
})

const PRINCIPLES = [
  "We work ethically, with integrity and honesty.",
  "We pursue service excellence to enhance the needs of every customer.",
  "We do things right first time and every time.",
  "We support innovation and creativity that allows us to learn from our mistakes.",
  "We encourage and support individual development.",
  "We create an environment that allows us to enjoy our work and thrive.",
  "We celebrate individual and team success.",
]

export default function AboutUsPage() {
  return (
    <InfoLayout
      title="About Us"
      subtitle="The next generation multi-brand ingredients platform"
      current="/about-us"
    >
      <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
        <div>
          <H2>Who we are</H2>
          <P>
            SaiSukrithkar Supplements Private Limited is a startup distributor and
            supplier of premium quality multi-brand ingredients for the Nutra and
            Food industry. We specialise in sourcing multi-brand food and Nutra
            ingredients under one umbrella for the local and global market.
          </P>
          <P>
            Ingredients Bazar is our revolutionary platform, offering over 101
            premium quality ingredients procured through 350 of the best brands,
            with live inventory. We aim to contribute to your success through
            quality, timely delivery and continued support.
          </P>
        </div>
        <Figure src="/pages/about-1.jpg" alt="Soybeans in a sack with a wooden scoop" className="aspect-[8/5]" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 my-8">
        <div className="rounded-2xl border border-[#d9edb8] bg-[#f6fbee] p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-[#4d7c0f] mb-2">Our Vision</div>
          <p className="text-sm leading-relaxed text-[#334155]">
            To become the globally most preferred and reliable intermediary
            organisation for premium quality multi-brand ingredients for the Nutra
            and Food industry, driven by values, innovation and expertise.
          </p>
        </div>
        <div className="rounded-2xl border border-[#cfe5f4] bg-[#eaf5fc] p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-[#0077cf] mb-2">Our Mission</div>
          <p className="text-sm leading-relaxed text-[#334155]">
            To enrich and empower the Nutra and Food industry customer base through
            our premium, quality multi-brand ingredient supply, by establishing the
            Ingredients Bazar platform as the most trusted organisation.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-6 items-start">
        <Figure src="/pages/about-5.jpg" alt="Cocoa beans and cocoa powder on a wooden spoon" className="aspect-[4/3]" />
        <div>
          <H2>Principles that guide our work</H2>
          <Checklist items={PRINCIPLES} />
        </div>
      </div>

      <H2>Our founder</H2>
      <P>
        R.D. Madhuraj is a food technocrat with more than 19 years of experience
        in the Food and Nutra industry. He founded Ingredientsbazar.com in 2018 to
        revolutionise the way manufacturers and co-manufacturers purchase
        ingredients for the food and nutra industry.
      </P>
    </InfoLayout>
  )
}
