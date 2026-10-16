import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ArrowRightIcon,
  CheckIcon,
  PlayIcon,
  WarnIcon,
} from "@modules/layout/components/ib-icons"
import { TRUST_FEATURES } from "../hero"

const ORDER_PROCESS = [
  { step: "1", title: "Select the Product", desc: "Browse our catalogue and add the desired quantity to your cart" },
  { step: "2", title: "Receive Proforma Invoice", desc: "Our team reviews your order and sends an itemised pricing quote" },
  { step: "3", title: "Order Confirmation", desc: "Confirm the order with payment by bank transfer (RTGS / NEFT)" },
  { step: "4", title: "Documentation & Dispatch", desc: "COA included with the shipment, same-day dispatch available" },
]

export const OrderProcess = () => (
  <section className="bg-[#f8fffe] border-y border-[#e2f3eb] py-12">
    <div className="max-w-[1440px] mx-auto px-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#0f172a] mb-1">Simple Process</h2>
        <p className="text-sm text-[#64748b]">
          From selection to delivery — straightforward B2B ordering
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
        <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-[#dcfce7]" />
        {ORDER_PROCESS.map((step) => (
          <div
            key={step.step}
            className="relative z-[1] bg-white border border-gray-100 rounded-xl p-5 text-center hover:border-[#006B4F]/20 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-[#006B4F] text-white rounded-full flex items-center justify-center text-sm font-extrabold mx-auto mb-3">
              {step.step}
            </div>
            <div className="font-bold text-[#0f172a] text-sm mb-1.5">{step.title}</div>
            <p className="text-[11px] text-[#64748b] leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

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
  "Open Sign Up / Login from the top-right of the menu bar.",
  "Choose Register to open the registration page.",
  "Pick the account type that describes you: buyer or supplier.",
  "Complete your company details and contact information.",
  "Submit your application for review.",
  "Account verification and approval usually take 24–48 hours.",
]

const GUIDES = [
  {
    eyebrow: "Ordering Guide",
    title: "How to Place an Order",
    description: "The complete process from product selection through payment and invoicing.",
    steps: ORDER_INSTRUCTIONS,
    action: "Browse Products",
    href: "/store",
    accent: "bg-[#006B4F]",
    highlightFrom: 6,
    soft: "bg-[#f0fdf4] border-[#bbf7d0]",
  },
  {
    eyebrow: "Account Guide",
    title: "How to Sign Up",
    description: "Create the right account for your business and submit it for verification.",
    steps: SIGNUP_INSTRUCTIONS,
    action: "Create an Account",
    href: "/account",
    accent: "bg-[#0757a8]",
    highlightFrom: 99,
    soft: "bg-blue-50 border-blue-100",
  },
]

export const InstructionVideos = () => (
  <section className="bg-white py-14">
    <div className="max-w-[1440px] mx-auto px-6">
      <div className="max-w-2xl mx-auto text-center mb-9">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f0fdf4] border border-[#dcfce7] text-[#006B4F] text-xs font-bold uppercase tracking-wider rounded-full mb-3">
          <PlayIcon className="w-3.5 h-3.5" />
          Instruction Videos
        </div>
        <h2 className="text-3xl font-bold text-[#0f172a]">
          Get Started with Ingredients Bazar
        </h2>
        <p className="text-sm text-[#64748b] leading-relaxed mt-2">
          Step-by-step instructions to register your business account and place
          your first order with confidence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {GUIDES.map((guide) => (
          <article
            key={guide.title}
            className="overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm"
          >
            <div className={`${guide.accent} relative overflow-hidden px-6 py-6`}>
              <div className="absolute -top-12 -right-10 w-40 h-40 rounded-full border-[24px] border-white/5" />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-white/[.15] border border-white/20 text-white">
                  <PlayIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
                    {guide.eyebrow}
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-1">{guide.title}</h3>
                  <p className="text-xs leading-relaxed text-white/75 mt-2 max-w-lg">
                    {guide.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="relative aspect-video rounded-xl bg-gradient-to-br from-[#0d3320] to-[#075e54] flex flex-col items-center justify-center text-white/80 mb-5">
                <span className="w-14 h-14 rounded-full bg-white/15 border border-white/25 flex items-center justify-center">
                  <PlayIcon className="w-7 h-7 text-white" />
                </span>
                <span className="mt-3 text-xs font-semibold">Video coming soon</span>
              </div>
              <div className="rounded-xl bg-[#f8fafc] border border-gray-100 p-4 sm:p-5">
                <div className="pb-3 mb-4 border-b border-gray-200 text-xs font-bold text-[#334155] uppercase tracking-wider">
                  Written Instructions
                </div>
                <ol className="space-y-3">
                  {guide.steps.map((step, index) => {
                    const important = index >= guide.highlightFrom
                    return (
                      <li
                        key={step}
                        className={`flex gap-3 rounded-xl ${important ? `${guide.soft} border p-3` : ""}`}
                      >
                        <span
                          className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                            important
                              ? `${guide.accent} text-white`
                              : "bg-white border border-gray-200 text-[#475569]"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <p
                          className={`text-xs leading-relaxed pt-1 ${
                            important ? "font-semibold text-[#334155]" : "text-[#475569]"
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
                className={`w-full mt-6 py-3 ${guide.accent} text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
              >
                {guide.action}
                <ArrowRightIcon className="w-4 h-4" />
              </LocalizedClientLink>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
)

const COMPARISON = [
  { feature: "Cost Effective", others: "Variable pricing", ib: "Cost-effective sourcing" },
  { feature: "Transparency", others: "Limited visibility", ib: "Transparent slab pricing" },
  { feature: "Hidden Costs", others: "Additional charges may apply", ib: "No hidden costs" },
  { feature: "Documents", others: "Often shared on request", ib: "Quality documents available" },
  { feature: "Live Inventory", others: "Usually unavailable", ib: "Live inventory visibility" },
]

export const MarketplaceComparison = () => (
  <section className="bg-[#f8fffe] border-y border-[#e2f3eb] py-14">
    <div className="max-w-[1120px] mx-auto px-6">
      <div className="max-w-2xl mx-auto text-center mb-9">
        <div className="text-xs font-bold text-[#006B4F] uppercase tracking-wider mb-2">
          The Ingredients Bazar Difference
        </div>
        <h2 className="text-3xl font-bold text-[#0f172a]">
          A Better Way to Source Ingredients
        </h2>
        <p className="text-sm text-[#64748b] leading-relaxed mt-2">
          Compare the traditional sourcing experience with a marketplace built
          for transparent, informed B2B purchasing.
        </p>
      </div>

      <div className="overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="hidden sm:grid grid-cols-[1.1fr_1fr_1fr] bg-[#0d3320] text-white">
          <div className="px-5 py-4 text-xs font-bold uppercase tracking-wider">What Matters</div>
          <div className="px-5 py-4 text-xs font-bold uppercase tracking-wider border-l border-white/10">
            Other Companies
          </div>
          <div className="px-5 py-4 text-xs font-bold uppercase tracking-wider bg-[#006B4F] border-l border-white/10">
            Ingredients Bazar
          </div>
        </div>
        {COMPARISON.map((item, index) => (
          <div
            key={item.feature}
            className={`grid grid-cols-1 sm:grid-cols-[1.1fr_1fr_1fr] ${
              index !== COMPARISON.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <div className="px-5 py-4 bg-gray-50 sm:bg-white text-xs font-bold text-[#0f172a]">
              {item.feature}
            </div>
            <div className="flex items-center gap-2 px-5 py-3 sm:py-4 text-xs text-[#64748b] sm:border-l border-gray-100">
              <span className="w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <WarnIcon className="w-3 h-3" />
              </span>
              <span>
                <span className="sm:hidden font-semibold text-[#475569]">Other companies: </span>
                {item.others}
              </span>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 sm:py-4 bg-[#f0fdf4] text-xs font-semibold text-[#14532d] sm:border-l border-[#dcfce7]">
              <span className="w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-[#006B4F] text-white">
                <CheckIcon className="w-3 h-3" />
              </span>
              <span>
                <span className="sm:hidden font-semibold">Ingredients Bazar: </span>
                {item.ib}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export const WhyChooseUs = () => (
  <section className="bg-[#0d3320] py-14">
    <div className="max-w-[1440px] mx-auto px-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Why Ingredients Bazar?</h2>
        <p className="text-[#86efac] text-sm max-w-xl mx-auto">
          Enabling food and nutraceutical companies to source and order bulk
          ingredients with live inventory, pricing and quality certifications.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TRUST_FEATURES.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="bg-white/[.08] border border-white/10 rounded-xl p-5 hover:bg-white/[.12] transition-colors"
          >
            <span className="w-11 h-11 mb-3 rounded-xl bg-white/10 flex items-center justify-center text-[#86efac]">
              <Icon className="w-6 h-6" />
            </span>
            <div className="font-bold text-white text-sm mb-2">{title}</div>
            <p className="text-[#86efac]/80 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const TESTIMONIALS = [
  {
    name: "Rajesh Kumar",
    company: "Wellness Nutrition Pvt Ltd",
    role: "Procurement Manager",
    content:
      "Ingredients Bazar has transformed our sourcing process. The quality documentation and competitive pricing make them our go-to platform for raw materials.",
  },
  {
    name: "Priya Sharma",
    company: "Golden Bakery Industries",
    role: "Quality Head",
    content:
      "Excellent service and product quality. The COA and certificates provided give us complete confidence in their ingredients.",
  },
  {
    name: "Amit Patel",
    company: "NutriGain Supplements",
    role: "Founder & CEO",
    content:
      "The multi-brand sourcing platform saves us time and money. One-stop solution for all our ingredient needs.",
  },
]

export const Testimonials = () => (
  <section className="bg-[#f0fdf4] border-y border-[#dcfce7] py-12">
    <div className="max-w-[1440px] mx-auto px-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#0f172a] mb-1">What Our Clients Say</h2>
        <p className="text-sm text-[#64748b]">Trusted by manufacturers across India</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            className="bg-white border border-gray-100 rounded-xl p-5 hover:border-[#006B4F]/20 hover:shadow-sm transition-all"
          >
            <div className="flex gap-0.5 mb-3 text-yellow-400 text-sm" aria-label="5 out of 5">
              ★★★★★
            </div>
            <p className="text-sm text-[#374151] leading-relaxed mb-4 italic">
              &ldquo;{t.content}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#006B4F] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                {t.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <div className="text-sm font-bold text-[#0f172a]">{t.name}</div>
                <div className="text-[10px] text-[#64748b]">
                  {t.role}, {t.company}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export const CtaBanner = () => (
  <section className="max-w-[1440px] mx-auto px-6 py-12">
    <div className="bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border border-[#bbf7d0] rounded-2xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-[#0f172a] mb-2">
          Ready to streamline your
          <br className="hidden lg:block" /> ingredient sourcing?
        </h2>
        <p className="text-[#64748b] text-sm max-w-lg">
          Register your business to unlock slab pricing, live stock and
          quality-assured ingredient sourcing.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        <LocalizedClientLink
          href="/contact"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#006B4F] hover:bg-[#005a42] text-white font-semibold text-sm rounded-lg transition-colors"
        >
          Post a Requirement <ArrowRightIcon className="w-4 h-4" />
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/suppliers"
          className="inline-flex items-center justify-center px-6 py-3 bg-white border border-[#006B4F]/30 text-[#006B4F] hover:border-[#006B4F] font-semibold text-sm rounded-lg transition-colors"
        >
          Browse Suppliers
        </LocalizedClientLink>
      </div>
    </div>
  </section>
)
