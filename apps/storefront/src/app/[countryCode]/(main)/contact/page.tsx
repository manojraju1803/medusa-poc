import { Metadata } from "next"

import ContactForm from "@modules/contact/components/contact-form"
import PageBanner from "@modules/suppliers/components/page-banner"

export const metadata: Metadata = {
  title: "Contact us | IngredientsBazar",
  description: "Get in touch with the Ingredients Bazar sourcing team.",
}

// Public details from www.ingredientsbazar.com/contacts (2026-10-17).
const PHONE = "+91 90350 22477"
const DETAILS = [
  { icon: "✉️", label: "Email", val: "sales@ingredientsbazar.com" },
  { icon: "📞", label: "Phone", val: PHONE },
  { icon: "📍", label: "Office", val: "Bannerughatta Road, Bengaluru, Karnataka" },
  { icon: "🕒", label: "Office Hours", val: "Mon–Sat 10:00 AM – 6:30 PM" },
]
const LOCATIONS = [
  {
    city: "Bengaluru",
    type: "Office",
    addr: "#716, 7th Cross, Weaver's Colony, Gottigere Post, Bannerughatta Road, Bengaluru 560083",
  },
  {
    city: "Bengaluru",
    type: "Warehouse",
    addr: "#84/1, Near Rockwood Green Public School, C.K. Palya Main Road, Basavanapura, Bannerughatta Road, Bengaluru 560083",
  },
]

export default async function ContactPage(props: {
  searchParams: Promise<{ subject?: string }>
}) {
  const { subject } = await props.searchParams

  return (
    <div className="min-h-screen bg-[#fafdf5]" data-testid="contact-page">
      <PageBanner
        title="Contact Us"
        subtitle="Get in touch with our expert sourcing team — we're here to help"
      />
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          <ContactForm defaultSubject={subject || ""} />
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <h4 className="text-sm font-bold text-[#0f172a] mb-3">
                Our Contact Details
              </h4>
              {DETAILS.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="text-base shrink-0" aria-hidden="true">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-[9px] text-[#9ca3af] uppercase font-bold">
                      {item.label}
                    </p>
                    <p className="text-xs text-[#374151]">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <h4 className="text-sm font-bold text-[#0f172a] mb-3">
                Our Global Presence
              </h4>
              <div className="space-y-3">
                {LOCATIONS.map((loc) => (
                  <div
                    key={loc.type}
                    className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="w-6 h-6 bg-[#f6fbee] rounded-lg flex items-center justify-center text-[#4d7c0f] shrink-0">
                      🏢
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#0f172a]">
                        {loc.city}{" "}
                        <span className="text-[9px] font-normal text-[#4d7c0f]">
                          ({loc.type})
                        </span>
                      </p>
                      <p className="text-[9px] text-[#64748b]">{loc.addr}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#00356e] rounded-2xl p-4 text-center">
              <div className="text-xl mb-1">💬</div>
              <p className="text-xs font-bold text-white mb-1">
                Need Immediate Assistance?
              </p>
              <p className="text-[9px] text-[#c5e39a]/70 mb-3">
                Talk to our sourcing team right now
              </p>
              <a
                href={`tel:${PHONE.replace(/\s/g, "")}`}
                className="block w-full py-2 bg-[#7aba0c] hover:bg-[#6aa30a] text-[#00254d] text-xs font-bold rounded-xl transition-colors"
              >
                Call {PHONE}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
