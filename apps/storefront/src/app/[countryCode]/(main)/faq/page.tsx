import { staticPageMetadata } from "@lib/util/seo"
import React from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  Checklist,
  InfoLayout,
  Mail,
  P,
  Phone,
} from "@modules/info-pages/components/info-layout"

export const generateMetadata = staticPageMetadata({
  path: "/faq",
  title: "FAQ",
  description:
    "Answers about registration, documents, payments, order confirmation, shipping and quality at Ingredients Bazar.",
})

const link = "font-semibold text-[#0757a8] hover:underline"

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What do we sell and who is our target segment?",
    a: (
      <P>
        We cater to B2B customers (manufacturers, end users and traders only),
        with a varied range of products listed in our{" "}
        <LocalizedClientLink href="/store" className={link}>catalogue</LocalizedClientLink>.
        Explore the portal to see our complete range of products and services, or
        reach out to us at <Mail /> for queries and orders.
      </P>
    ),
  },
  {
    q: "How do I register on the portal?",
    a: (
      <>
        <P>
          It&apos;s easy to register: open{" "}
          <LocalizedClientLink href="/account" className={link}>My Account</LocalizedClientLink>{" "}
          and fill in the required information. If you&apos;re an existing
          customer of SaiSukrithkar Supplements Private Limited, we can complete
          the whole process for you. Just email us at <Mail /> and we&apos;ll
          let you know when your account is ready for purchases.
        </P>
        <P>
          <strong className="text-[#0f172a]">Having trouble logging in?</strong>{" "}
          Try resetting your password. If the issue persists, call customer
          service on <Phone /> and we&apos;ll help you resolve it.
        </P>
        <P>
          <strong className="text-[#0f172a]">Deactivating an account:</strong>{" "}
          email us at <Mail /> if you need to deactivate or close your account.
        </P>
        <P>
          <strong className="text-[#0f172a]">Multiple user logins:</strong>
        </P>
        <Checklist
          items={[
            "Multiple users share one account: recommended when several people use the same email account, such as purchasing@companyname.com. Everyone can see the full list of orders placed by the company.",
            "Register multiple accounts under the same company name: each user manages their own account but won't see orders placed by other members. Advisable if different buyers handle different product portfolios.",
          ]}
        />
      </>
    ),
  },
  {
    q: "How do I find documents and product specifications online?",
    a: (
      <P>
        Users have 24/7 access to QC documents such as specification sheets,
        MSDS, Non-GMO, Kosher and Halal certificates, on request after purchase.
      </P>
    ),
  },
  {
    q: "Can I see the current batch COA?",
    a: (
      <P>
        Yes, in a non-downloadable version. You can download the COA once the
        purchase is complete.
      </P>
    ),
  },
  {
    q: "How do I modify or return an order?",
    a: (
      <P>
        Contact us on <Phone /> or at <Mail to="sales@ingredientsbazar.com" /> to
        cancel or change details on an already confirmed order. We will need a
        specific time frame for revisions and cancellations.
      </P>
    ),
  },
  {
    q: "What payment modes are accepted?",
    a: (
      <P>
        RTGS / NEFT bank transfer. We do not store any customer card or bank
        details on our servers. Once the payment is made, please make sure the
        transaction ID is filled in on the transaction page.
      </P>
    ),
  },
  {
    q: "When will I receive order confirmation?",
    a: (
      <P>
        Once we receive your payment, Ingredients Bazar sends order confirmation
        and ready-for-dispatch confirmation by phone and email. You can also
        check your order status by logging in to your account. Once the order
        ships, it is updated with tracking information and you&apos;ll receive
        an email with the shipment tracking details.
      </P>
    ),
  },
  {
    q: "What shipping modes are available?",
    a: (
      <>
        <Checklist
          items={[
            "Self pick-up from our warehouse",
            "Paid door delivery",
            "To-pay: self pick-up or your authorised transporter",
          ]}
        />
        <P>Note: working hours are 10:30 AM to 6:30 PM on working days only.</P>
      </>
    ),
  },
  {
    q: "Can I use my own shipping account or PO number?",
    a: (
      <P>
        You can choose your own transporter, carrier or courier partner for
        deliveries. Give us the carrier name and account number when placing the
        order. If we arrange paid transport, we&apos;ll share the shipment cost
        and delivery charges based on distance.
      </P>
    ),
  },
  {
    q: "How does Ingredients Bazar ensure product quality?",
    a: (
      <P>
        We source only the best quality ingredients. Before sourcing, our quality
        team audits the ingredient manufacturer or importer, and only qualified
        ingredients are placed on the platform. All products also include
        documentation that you can download and compare.
      </P>
    ),
  },
]

export default function FaqPage() {
  return (
    <InfoLayout
      title="Frequently Asked Questions"
      subtitle="Registration, documents, payments, shipping and quality"
      current="/faq"
    >
      <div className="space-y-3">
        {FAQS.map((item, i) => (
          <details
            key={item.q}
            open={i === 0}
            className="group rounded-xl border border-gray-100 open:border-[#bbf7d0] open:bg-[#f8fffe] transition-colors"
          >
            <summary className="flex items-center gap-3 cursor-pointer list-none px-4 py-3.5 [&::-webkit-details-marker]:hidden">
              <span className="w-7 h-7 shrink-0 rounded-full bg-[#166534] text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-bold text-[#0f172a]">{item.q}</span>
              <svg className="w-4 h-4 text-[#64748b] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-4 pb-2 pl-14">{item.a}</div>
          </details>
        ))}
      </div>
    </InfoLayout>
  )
}
