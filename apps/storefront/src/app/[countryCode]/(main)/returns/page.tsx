import { Metadata } from "next"

import {
  Checklist,
  H2,
  InfoLayout,
  Mail,
  P,
  Phone,
} from "@modules/info-pages/components/info-layout"

export const metadata: Metadata = {
  title: "Returns | IngredientsBazar",
  description: "Returns, cancellations and refunds at Ingredients Bazar.",
}

export default function ReturnsPage() {
  return (
    <InfoLayout
      title="Returns"
      subtitle="Returns, cancellations and refunds"
      current="/returns"
    >
      <H2>How can I return an item purchased from ingredientsbazar.com?</H2>
      <P>
        You can place a return request if you&apos;ve received an item in a
        &quot;Damaged&quot;, &quot;Defective&quot; or &quot;Not as Described&quot;
        state. To return a product, write to us at <Mail /> or call our helpline
        on <Phone /> with:
      </P>
      <Checklist
        items={[
          "Order ID",
          "Reason for returning the item",
          "Images clearly showing the damaged or missing product in the order",
        ]}
      />
      <P>
        Once we receive your request, Ingredients Bazar customer support will
        confirm the return and let you know about the pickup process. Return
        packages should be adequately packed. The final decision on the request
        lies with Ingredients Bazar and cannot be contested.
      </P>

      <H2>Cancellation &amp; refunds</H2>
      <div className="grid sm:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-[#d9edb8] bg-[#f6fbee] p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#4d7c0f] mb-2">
            Before you receive the order
          </h3>
          <p className="text-sm leading-relaxed text-[#334155]">
            You can cancel the order online any time before it is dispatched. Once
            you request cancellation, it takes a maximum of 1–2 business days to
            cancel the order, and we notify you by email. Your entire order amount
            is refunded within 3–4 working days.
          </p>
        </section>
        <section className="rounded-2xl border border-[#cfe5f4] bg-[#eaf5fc] p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#0077cf] mb-2">
            After you receive the order
          </h3>
          <p className="text-sm leading-relaxed text-[#334155]">
            For returns after delivery, send Ingredients Bazar a return request. If
            the request is accepted, the entire refund amount is reversed to you
            through NEFT/RTGS. Depending on the case, Ingredients Bazar decides
            whether the seller or the buyer bears the logistics (sending and
            return) charges.
          </p>
        </section>
      </div>
    </InfoLayout>
  )
}
