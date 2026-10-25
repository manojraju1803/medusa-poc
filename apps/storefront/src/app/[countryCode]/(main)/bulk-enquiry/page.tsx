import { Metadata } from "next"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  Checklist,
  Figure,
  H2,
  InfoLayout,
  Mail,
  P,
} from "@modules/info-pages/components/info-layout"

export const metadata: Metadata = {
  title: "Bulk Enquiry | IngredientsBazar",
  description:
    "Bulk buying and monthly multi-brand ingredient sourcing plans from Ingredients Bazar.",
}

export default function BulkEnquiryPage() {
  return (
    <InfoLayout
      title="Bulk Enquiry"
      subtitle="Source differently, save effectively"
      current="/bulk-enquiry"
    >
      <P>
        Bulk buying is buying a large quantity of a particular ingredient at one
        time. Most of our customers order limited quantities, but bulk buying is
        also available, with on-time delivery assured.
      </P>

      <div className="grid md:grid-cols-[1fr_340px] gap-6 items-center my-6">
        <div>
          <H2>We can be your complete sourcing agent</H2>
          <P>
            We provide multi-brand food and nutra ingredient sourcing with a
            monthly purchase plan, so you don&apos;t have to worry about sourcing.
            It saves you:
          </P>
          <Checklist
            items={[
              "Energy and time",
              "Pricing at its best",
              "Documents support",
              "Wide range comparison",
              "Dispatch as promised",
              "A hassle-free monthly sourcing partner",
            ]}
          />
        </div>
        <Figure src="/pages/bulk-2-1.png" alt="Bulk ingredient bags stacked in a warehouse" className="border-0 object-contain" />
      </div>

      <div className="grid md:grid-cols-[340px_1fr] gap-6 items-center my-6">
        <Figure src="/pages/bulk-3.png" alt="Forklift moving bulk ingredient sacks" className="border-0 object-contain" />
        <div>
          <H2>How do we deliver?</H2>
          <P>
            As your sourcing partner, we offer end-to-end sourcing solutions,
            sourcing quality multi-brand food and nutra ingredients globally for
            your business through our wide network and resourcing capabilities.
          </P>
          <P>
            With explicit procurement procedures, from multi-brand selection,
            document support and quality assurance to genuine pricing and
            comparison power, rest assured all your sourcing needs are well taken
            care of.
          </P>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-[#00356e] to-[#4d7c0f] p-6 text-white flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="text-lg font-extrabold">Source like a pro</div>
          <p className="text-sm text-white/80 mt-1">
            For a monthly multi-brand food and nutra ingredient sourcing plan,
            write to <span className="[&_a]:text-[#c5e39a]"><Mail /></span> or send
            us your requirement.
          </p>
        </div>
        <LocalizedClientLink
          href="/contact?subject=Bulk%20Enquiry"
          className="shrink-0 px-5 py-2.5 bg-[#7aba0c] hover:bg-[#6aa30a] text-[#00254d] text-sm font-bold rounded-xl transition-colors text-center"
        >
          Send a bulk enquiry
        </LocalizedClientLink>
      </div>
    </InfoLayout>
  )
}
