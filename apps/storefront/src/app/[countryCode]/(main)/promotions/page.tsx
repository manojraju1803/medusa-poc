import { staticPageMetadata } from "@lib/util/seo"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { H2, InfoLayout, P } from "@modules/info-pages/components/info-layout"

export const generateMetadata = staticPageMetadata({
  path: "/promotions",
  title: "Promotions",
  description:
    "Brand promotion, bulk ingredient sales and new product launches with Ingredients Bazar.",
})

const STEPS = [
  {
    title: "We create a colourful banner",
    text: "We showcase the banner on our home page and on your preferred promotion page, helping to trigger sales across customers.",
  },
  {
    title: "Strong social media campaign team",
    text: "We send a promotion mail about the sale or new ingredient launch to our wide customer base, making your presence felt in a positive way.",
  },
  {
    title: "Preferred date and time sale",
    text: "Sales run on your preferred date to match customer needs, with unparalleled offers such as big billion day sales and big shopping days.",
  },
  {
    title: "Social media marketing",
    text: "We promote your ingredients through our strong social media presence on LinkedIn, blogging, Twitter, Facebook, SEO and more, giving your brand consistency across all channels.",
  },
]

const BANNERS = ["promo-1.jpg", "promo-4.jpg", "promo-5.jpg", "promo-6-1.jpg"]

export default function PromotionsPage() {
  return (
    <InfoLayout
      title="Promotions"
      subtitle="Be the smart sourcer"
      current="/promotions"
    >
      <P>
        Getting into an affiliate network, advertising, online brand promotion and
        bulk ingredient sales is not easy. Getting people to pay attention is
        difficult, and getting them to share and care is even harder. Promote your
        brand in a way that users willingly share your content: Ingredients Bazar
        helps you build your brand and liquidate bulk ingredients through
        promotions and sales.
      </P>

      <H2>How does it work?</H2>
      <ol className="grid sm:grid-cols-2 gap-4 mb-6">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rounded-2xl border border-gray-100 p-4 flex gap-3">
            <span className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[#4ade80] to-[#0757a8] text-white text-sm font-extrabold flex items-center justify-center">
              {i + 1}
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#0f172a] mb-1">{s.title}</h3>
              <p className="text-xs leading-relaxed text-[#475569]">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <H2>Past promotion banners</H2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {BANNERS.map((b) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={b}
            src={`/pages/${b}`}
            alt="Ingredients Bazar promotion banner"
            loading="lazy"
            className="w-full rounded-xl border border-gray-100"
          />
        ))}
      </div>

      <H2>New product launch</H2>
      <P>
        Launching a product is no easy process. It takes a real investment of time
        and energy, because you want the launch to be successful and well received
        by your audience. After all the resources that went into creating the
        product or service, it deserves a launch to match. We educate people about
        your brand, launching new products with influencer marketing, the required
        PR material and social media buzz, targeting the right customers.
      </P>

      <div className="mt-6 flex flex-wrap gap-3">
        <LocalizedClientLink
          href="/contact?subject=Promotions"
          className="px-5 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white text-sm font-bold rounded-xl transition-colors"
        >
          Promote your brand
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/deals"
          className="px-5 py-2.5 border border-[#0757a8]/40 text-[#0757a8] hover:bg-[#eff6ff] text-sm font-bold rounded-xl transition-colors"
        >
          See current deals
        </LocalizedClientLink>
      </div>
    </InfoLayout>
  )
}
