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
  <section className="bg-[#fafdf5] border-y border-[#e6f2d6] py-12">
    <div className="max-w-[1440px] mx-auto px-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#0f172a] mb-1">Simple Process</h2>
        <p className="text-sm text-[#64748b]">
          From selection to delivery — straightforward B2B ordering
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
        <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-[#ecf6dc]" />
        {ORDER_PROCESS.map((step) => (
          <div
            key={step.step}
            className="relative z-[1] bg-white border border-gray-100 rounded-xl p-5 text-center hover:border-[#4d7c0f]/20 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-[#4d7c0f] text-white rounded-full flex items-center justify-center text-sm font-extrabold mx-auto mb-3">
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
  <section className="bg-[#fafdf5] border-y border-[#e6f2d6] py-14">
    <div className="max-w-[1120px] mx-auto px-6">
      <div className="max-w-2xl mx-auto text-center mb-9">
        <div className="text-xs font-bold text-[#4d7c0f] uppercase tracking-wider mb-2">
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
        <div className="hidden sm:grid grid-cols-[1.1fr_1fr_1fr] bg-[#00356e] text-white">
          <div className="px-5 py-4 text-xs font-bold uppercase tracking-wider">What Matters</div>
          <div className="px-5 py-4 text-xs font-bold uppercase tracking-wider border-l border-white/10">
            Other Companies
          </div>
          <div className="px-5 py-4 text-xs font-bold uppercase tracking-wider bg-[#4d7c0f] border-l border-white/10">
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
            <div className="flex items-center gap-2 px-5 py-3 sm:py-4 bg-[#f6fbee] text-xs font-semibold text-[#3f6212] sm:border-l border-[#ecf6dc]">
              <span className="w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-[#4d7c0f] text-white">
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
  <section className="bg-[#00356e] py-14">
    <div className="max-w-[1440px] mx-auto px-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Why Ingredients Bazar?</h2>
        <p className="text-[#c5e39a] text-sm max-w-xl mx-auto">
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
            <span className="w-11 h-11 mb-3 rounded-xl bg-white/10 flex items-center justify-center text-[#c5e39a]">
              <Icon className="w-6 h-6" />
            </span>
            <div className="font-bold text-white text-sm mb-2">{title}</div>
            <p className="text-[#c5e39a]/80 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

// Contact details as published on the original www.ingredientsbazar.com.
const CONTACT_CARDS = [
  {
    label: "Call us",
    value: "+91 90350 22477",
    href: "tel:+919035022477",
    icon: "M3 5a2 2 0 012-2h3.3a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.25 1.13a11 11 0 005.5 5.5l1.13-2.26a1 1 0 011.2-.49l4.49 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.7 21 3 14.3 3 6V5z",
  },
  {
    label: "Email us",
    value: "sales@ingredientsbazar.com",
    href: "mailto:sales@ingredientsbazar.com",
    icon: "M3 8l7.9 5.3a2 2 0 002.2 0L21 8m-2-3H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z",
  },
  {
    label: "Visit our office",
    value: "Gottigere, Bannerughatta Road, Bengaluru 560083",
    href: "/contact",
    icon: "M17.7 16.7L13.4 21a2 2 0 01-2.8 0l-4.3-4.3a8 8 0 1111.4 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    label: "Business hours",
    value: "Mon–Sat, 10:00 AM – 6:30 PM",
    icon: "M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
]

const ContactCard = ({ card }: { card: (typeof CONTACT_CARDS)[number] }) => {
  const body = (
    <>
      <span className="w-10 h-10 shrink-0 rounded-xl bg-[#7aba0c] text-[#00254d] flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-widest text-white/60">
          {card.label}
        </span>
        <span className="block text-sm font-semibold text-white break-words">{card.value}</span>
      </span>
    </>
  )
  const cls =
    "flex items-center gap-3 rounded-2xl bg-white/[.08] border border-white/15 p-4 backdrop-blur-sm"
  if (!card.href) return <div className={cls}>{body}</div>
  return card.href.startsWith("/") ? (
    <LocalizedClientLink href={card.href} className={`${cls} hover:bg-white/[.14] transition-colors`}>
      {body}
    </LocalizedClientLink>
  ) : (
    <a href={card.href} className={`${cls} hover:bg-white/[.14] transition-colors`}>
      {body}
    </a>
  )
}

export const CtaBanner = () => (
  <section className="px-4 sm:px-6 py-14">
    <div className="relative max-w-[1440px] mx-auto overflow-hidden rounded-3xl bg-gradient-to-br from-[#00254d] via-[#00356e] to-[#2f5d1a] shadow-[0_20px_50px_rgba(0,37,77,0.25)]">
      <div className="absolute inset-0 opacity-[.12] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px]" aria-hidden="true" />
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#7aba0c]/25 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-[#0077cf]/30 blur-3xl" aria-hidden="true" />

      <div className="relative grid lg:grid-cols-[1.1fr_1fr] gap-10 p-8 sm:p-12 lg:p-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#c5e39a] text-xs font-semibold mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7aba0c] animate-pulse" />
            Talk to our sourcing team
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
            Ready to streamline your
            <span className="block text-[#7aba0c]">ingredient sourcing?</span>
          </h2>
          <p className="text-white/75 text-sm sm:text-base leading-relaxed mt-4 max-w-xl">
            Tell us what you need: ingredient, quantity, delivery location and
            timeline. Our team replies with pricing, availability and quality
            documents, usually within 24 hours. Registered buyers also unlock
            slab pricing and live stock.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <LocalizedClientLink
              href="/contact?subject=Requirement"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#7aba0c] hover:bg-[#6aa30a] text-[#00254d] font-bold text-sm rounded-xl shadow-lg transition-colors"
            >
              Post a Requirement <ArrowRightIcon className="w-4 h-4" />
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-sm rounded-xl transition-colors"
            >
              Contact Us
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account"
              className="inline-flex items-center justify-center px-6 py-3.5 text-[#c5e39a] hover:text-white font-semibold text-sm transition-colors"
            >
              Register your business →
            </LocalizedClientLink>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {CONTACT_CARDS.map((card) => (
            <ContactCard key={card.label} card={card} />
          ))}
        </div>
      </div>
    </div>
  </section>
)
