import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRightIcon } from "@modules/layout/components/ib-icons"

const ORDER_INSTRUCTIONS = [
  "Log in to the Ingredients Bazar website.",
  "Select the product you want to order.",
  "Add your desired quantity to the cart.",
  "Enter the delivery location on the cart page.",
  "Enter the required details on the checkout page.",
  "Place the order. An itemised proforma invoice with bank details is sent to your registered email.",
  "Pay the order amount by bank transfer. Once payment is received, a final invoice is sent.",
  "For same-day dispatch, place your order and complete payment before 2:00 PM.",
]

const SIGNUP_INSTRUCTIONS = [
  "Click Get Started at the top-right of the menu bar.",
  "Choose Create an account under the sign-in form.",
  "Pick Buyer, R&D or Supplier at the top of the registration page.",
  "Complete your company and contact details and set a password.",
  "Submit your application for review.",
  "Account verification and approval usually take 24–48 hours.",
]

const svg = (d: string) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
  </svg>
)

const GUIDES = [
  {
    key: "order",
    eyebrow: "Ordering Guide",
    title: "How to Place an Order",
    description: "Follow the complete process from product selection through payment and invoicing.",
    icon: svg("M3 4h2l2.4 10.2a1 1 0 001 .8h8.9a1 1 0 001-.8L20 7H6.2M9 19.5a.5.5 0 11-1 0 .5.5 0 011 0zm9 0a.5.5 0 11-1 0 .5.5 0 011 0z"),
    steps: ORDER_INSTRUCTIONS,
    // Payment and same-day dispatch steps are the ones buyers most often miss.
    highlightFrom: 6,
    action: "Browse Products",
    href: "/store",
    header: "bg-[#006B4F]",
    solid: "bg-[#006B4F] hover:bg-[#00563f]",
    badge: "bg-[#006B4F]",
    soft: "bg-[#f0fdf4] border-[#bbf7d0]",
  },
  {
    key: "signup",
    eyebrow: "Account Guide",
    title: "How to Sign Up",
    description: "Create the right account for your business and submit it for verification.",
    icon: svg("M15 19v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1m16-11v6m3-3h-6M13 7a4 4 0 11-8 0 4 4 0 018 0z"),
    steps: SIGNUP_INSTRUCTIONS,
    highlightFrom: SIGNUP_INSTRUCTIONS.length,
    action: "Create an Account",
    href: "/account",
    header: "bg-[#0757a8]",
    solid: "bg-[#0757a8] hover:bg-[#064985]",
    badge: "bg-[#0757a8]",
    soft: "bg-[#eff6ff] border-[#bfdbfe]",
  },
] as const

type Guide = (typeof GUIDES)[number]

const GuideCard = ({ guide }: { guide: Guide }) => (
  <article className="flex flex-col bg-white border border-gray-100 rounded-2xl shadow-[0_4px_14px_rgba(15,23,42,0.06)] overflow-hidden">
    <header className={`relative overflow-hidden ${guide.header} text-white px-5 sm:px-6 py-6`}>
      <div className="absolute -top-14 -right-14 w-44 h-44 rounded-full border-[22px] border-white/[.07]" aria-hidden="true" />
      <div className="relative flex items-start gap-4">
        <span className="w-12 h-12 shrink-0 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
          {guide.icon}
        </span>
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-widest text-white/80">
            {guide.eyebrow}
          </div>
          <h3 className="text-xl sm:text-[22px] font-bold leading-tight mt-1">{guide.title}</h3>
          <p className="text-[13px] text-white/90 leading-relaxed mt-2.5">{guide.description}</p>
        </div>
      </div>
    </header>

    <div className="p-4 sm:p-6">
      <div className="rounded-xl border border-gray-100 bg-[#f8fafc] px-4 sm:px-5 py-5">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-200 text-xs font-bold text-[#334155] uppercase tracking-wider">
          <svg className="w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
          </svg>
          Written Instructions
        </div>
        <ol className="space-y-4">
          {guide.steps.map((step, index) => {
            const important = index >= guide.highlightFrom
            return (
              <li
                key={step}
                className={`flex items-start gap-3 ${
                  important ? `${guide.soft} border rounded-xl px-3 py-3` : ""
                }`}
              >
                <span
                  className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-[11px] font-bold ${
                    important
                      ? `${guide.badge} text-white`
                      : "bg-white border border-gray-200 text-[#334155]"
                  }`}
                >
                  {index + 1}
                </span>
                <p
                  className={`flex-1 pt-1 text-[13px] leading-relaxed ${
                    important ? "font-semibold text-[#0f172a]" : "text-[#334155]"
                  }`}
                >
                  {step}
                </p>
              </li>
            )
          })}
        </ol>
      </div>
      <LocalizedClientLink
        href={guide.href}
        className={`mt-6 py-3 ${guide.solid} text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2`}
      >
        {guide.action}
        <ArrowRightIcon className="w-4 h-4" />
      </LocalizedClientLink>
    </div>
  </article>
)

export const InstructionVideos = () => (
  <section className="bg-white py-14">
    <div className="max-w-[1440px] mx-auto px-6">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f0fdf4] border border-[#dcfce7] text-[#006B4F] text-xs font-bold uppercase tracking-wider rounded-full mb-4">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.6-2.3a1 1 0 011.4.9v6.8a1 1 0 01-1.4.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Instruction Videos
        </div>
        <h2 className="text-[28px] sm:text-3xl font-bold text-[#0f172a] tracking-tight">
          Get Started with Ingredients Bazar
        </h2>
        <p className="text-sm sm:text-[15px] text-[#64748b] leading-relaxed mt-3">
          Use these step-by-step instructions to register your business account
          and place your first order with confidence.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {GUIDES.map((g) => (
          <GuideCard key={g.key} guide={g} />
        ))}
      </div>
    </div>
  </section>
)

export default InstructionVideos
