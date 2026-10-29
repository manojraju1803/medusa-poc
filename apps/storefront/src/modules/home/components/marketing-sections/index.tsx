import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ArrowRightIcon,
  CheckIcon,
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
  <section className="bg-[#f8fffe] border-y border-[#e8f5e9] py-12">
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
            className="relative z-[1] bg-white border border-gray-100 rounded-xl p-5 text-center hover:border-[#166534]/20 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-[#166534] text-white rounded-full flex items-center justify-center text-sm font-extrabold mx-auto mb-3">
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

const COMPARISON = [
  { feature: "Cost Effective", others: "Variable pricing", ib: "Cost-effective sourcing" },
  { feature: "Transparency", others: "Limited visibility", ib: "Transparent slab pricing" },
  { feature: "Hidden Costs", others: "Additional charges may apply", ib: "No hidden costs" },
  { feature: "Documents", others: "Often shared on request", ib: "Quality documents available" },
  { feature: "Live Inventory", others: "Usually unavailable", ib: "Live inventory visibility" },
]

export const MarketplaceComparison = () => (
  <section className="bg-[#f8fffe] border-y border-[#e8f5e9] py-14">
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
        <h2 className="text-3xl font-bold text-white mb-3">Why Ingredients Bazar?</h2>
        <p className="text-[#86efac] text-sm sm:text-[15px] leading-relaxed max-w-[590px] mx-auto">
          Building trust through measurable results: enabling food and
          nutraceutical companies to source and order bulk ingredients with
          live inventory, pricing and quality certifications.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TRUST_FEATURES.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="bg-white/[.08] border border-white/15 rounded-xl p-5 hover:bg-white/[.12] transition-colors"
          >
            <Icon className="w-7 h-7 mb-4 text-[#86efac]" />
            <div className="font-bold text-white text-sm mb-2">{title}</div>
            <p className="text-[#86efac] text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export const CtaBanner = () => (
  <section className="bg-white px-4 sm:px-6 py-12">
    <div className="max-w-[1392px] mx-auto rounded-2xl border border-[#bbf7d0] bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7]">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 p-7 sm:p-12">
        <div className="max-w-xl">
          <h2 className="text-[28px] sm:text-4xl font-bold text-[#0f172a] leading-tight tracking-tight">
            Ready to streamline your
            <br className="hidden sm:block" /> ingredient sourcing?
          </h2>
          <p className="text-sm sm:text-[15px] text-[#475569] leading-relaxed mt-4">
            Tell us the ingredient, quantity and delivery location. Our team
            replies with pricing, availability and quality documents, usually
            within 24 hours.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <LocalizedClientLink
            href="/contact?subject=Requirement"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#166534] hover:bg-[#14532d] text-white font-bold text-sm rounded-lg shadow-sm transition-colors"
          >
            Post a Requirement <ArrowRightIcon className="w-4 h-4" />
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/suppliers"
            className="inline-flex items-center justify-center px-6 py-3.5 bg-white hover:border-[#166534] border border-[#166534]/30 text-[#166534] font-bold text-sm rounded-lg transition-colors"
          >
            Browse Suppliers
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  </section>
)
