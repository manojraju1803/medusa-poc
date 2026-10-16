import { Metadata } from "next"

import ContactForm from "@modules/contact/components/contact-form"
import PageBanner from "@modules/suppliers/components/page-banner"

export const metadata: Metadata = {
  title: "Contact us | IngredientsBazar",
  description: "Get in touch with the Ingredients Bazar sourcing team.",
}

// Placeholder contact details until the client confirms the real ones.
const DETAILS = [
  { label: "Email", val: "support@ingredientsbazar.com" },
  { label: "Phone", val: "+91 80 0000 0000" },
  { label: "Head Office & Warehouse", val: "Bangalore, Karnataka, India" },
  { label: "Office Hours", val: "Mon–Sat 9AM–6PM IST" },
]

export default async function ContactPage(props: {
  searchParams: Promise<{ subject?: string }>
}) {
  const { subject } = await props.searchParams

  return (
    <div className="min-h-screen bg-[#f8fffe]" data-testid="contact-page">
      <PageBanner
        title="Contact Us"
        subtitle="Get in touch with our sourcing team — we're here to help"
      />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
          <ContactForm defaultSubject={subject || ""} />
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <h4 className="text-sm font-bold text-[#0f172a] mb-3">
                Our Contact Details
              </h4>
              {DETAILS.map((item) => (
                <div
                  key={item.label}
                  className="py-2 border-b border-gray-50 last:border-0"
                >
                  <p className="text-[10px] text-[#9ca3af] uppercase font-bold">
                    {item.label}
                  </p>
                  <p className="text-sm text-[#374151]">{item.val}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#0d3320] rounded-2xl p-4">
              <p className="text-sm font-bold text-white mb-1">
                Looking for prices?
              </p>
              <p className="text-xs text-[#86efac]/80">
                Prices, quantity slabs and stock are shown to approved business
                accounts. Create an account and our team will review it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
