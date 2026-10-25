"use client"

import { useState } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRightIcon, PlayIcon } from "@modules/layout/components/ib-icons"

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
  "Choose Create an account under the sign-in form.",
  "Pick Buyer, R&D or Supplier at the top of the registration page.",
  "Complete your company and contact details and set a password.",
  "Submit your application for review.",
  "Account verification and approval usually take 24–48 hours.",
]

const GUIDES = [
  {
    key: "order",
    tab: "How to Place an Order",
    eyebrow: "Ordering Guide",
    description: "The complete process from product selection through payment and invoicing.",
    steps: ORDER_INSTRUCTIONS,
    // Payment and same-day dispatch steps are the ones buyers most often miss.
    highlightFrom: 6,
    action: "Browse Products",
    href: "/store",
    solid: "bg-[#4d7c0f] hover:bg-[#3f6212]",
    text: "text-[#4d7c0f]",
    soft: "bg-[#f6fbee] border-[#d9edb8]",
    video: "from-[#4d7c0f] via-[#2f5d1a] to-[#00356e]",
    stat: { value: "8", label: "steps to your first order" },
  },
  {
    key: "signup",
    tab: "How to Sign Up",
    eyebrow: "Account Guide",
    description: "Create the right account for your business and submit it for verification.",
    steps: SIGNUP_INSTRUCTIONS,
    highlightFrom: 5,
    action: "Create an Account",
    href: "/account",
    solid: "bg-[#0077cf] hover:bg-[#0062ab]",
    text: "text-[#0077cf]",
    soft: "bg-[#eaf5fc] border-[#c4e2f5]",
    video: "from-[#0077cf] via-[#0062ab] to-[#00254d]",
    stat: { value: "24–48h", label: "typical approval time" },
  },
] as const

export const InstructionVideos = () => {
  const [active, setActive] = useState(0)
  const guide = GUIDES[active]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f7fbfd] to-white py-16">
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#7aba0c]/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#0077cf]/10 blur-3xl" />

      <div className="relative max-w-[1240px] mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#d9edb8] text-[#4d7c0f] text-xs font-bold uppercase tracking-wider rounded-full shadow-sm mb-3">
            <PlayIcon className="w-3.5 h-3.5" />
            Instruction Videos
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a]">
            Get Started with{" "}
            <span className="bg-gradient-to-r from-[#4d7c0f] to-[#0077cf] bg-clip-text text-transparent">
              Ingredients Bazar
            </span>
          </h2>
          <p className="text-sm text-[#64748b] leading-relaxed mt-3">
            Step-by-step instructions to register your business account and place
            your first order with confidence.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Guides"
          className="mx-auto mb-8 flex w-fit max-w-full p-1 bg-white border border-gray-200 rounded-2xl shadow-sm"
        >
          {GUIDES.map((g, i) => (
            <button
              key={g.key}
              type="button"
              role="tab"
              id={`guide-tab-${g.key}`}
              aria-selected={i === active}
              aria-controls={`guide-panel-${g.key}`}
              onClick={() => setActive(i)}
              className={`px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors ${
                i === active ? `${g.solid} text-white shadow` : "text-[#475569] hover:text-[#0f172a]"
              }`}
            >
              {g.tab}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`guide-panel-${guide.key}`}
          aria-labelledby={`guide-tab-${guide.key}`}
          className="grid lg:grid-cols-[1.1fr_1fr] gap-6 bg-white border border-gray-100 rounded-3xl shadow-[0_10px_40px_rgba(15,23,42,0.06)] p-4 sm:p-6"
        >
          <div className="flex flex-col gap-4">
            <div
              className={`relative aspect-video rounded-2xl bg-gradient-to-br ${guide.video} overflow-hidden flex items-center justify-center`}
            >
              <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border-[28px] border-white/10" />
              <div className="relative flex flex-col items-center text-white">
                <span className="relative flex w-16 h-16">
                  <span className="absolute inset-0 rounded-full bg-white/30 animate-ping motion-reduce:animate-none" />
                  <span className="relative w-16 h-16 rounded-full bg-white text-[#00356e] flex items-center justify-center shadow-lg">
                    <PlayIcon className="w-7 h-7 ml-0.5" />
                  </span>
                </span>
                <span className="mt-4 text-sm font-bold">{guide.tab}</span>
                <span className="mt-1 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-semibold uppercase tracking-wider">
                  Video coming soon
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-2xl border p-4 ${guide.soft}`}>
                <div className={`text-2xl font-extrabold ${guide.text}`}>{guide.stat.value}</div>
                <div className="text-[11px] font-medium text-[#475569] mt-0.5">{guide.stat.label}</div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-[#f8fafc] p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                  {guide.eyebrow}
                </div>
                <p className="text-[11px] text-[#475569] leading-relaxed mt-1">{guide.description}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-xs font-bold text-[#334155] uppercase tracking-wider mb-4">
              Written Instructions
            </div>
            <ol className="relative flex-1">
              {guide.steps.map((step, index) => {
                const important = index >= guide.highlightFrom
                const last = index === guide.steps.length - 1
                return (
                  <li key={step} className="relative flex gap-3 pb-3">
                    {!last && (
                      <span className="absolute left-[13px] top-7 bottom-0 w-px bg-gray-200" aria-hidden="true" />
                    )}
                    <span
                      className={`relative z-[1] w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-[11px] font-extrabold ${
                        important
                          ? `${guide.solid} text-white shadow`
                          : "bg-white border-2 border-gray-200 text-[#475569]"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <p
                      className={`flex-1 text-xs leading-relaxed rounded-xl ${
                        important
                          ? `${guide.soft} border px-3 py-2 font-semibold text-[#334155]`
                          : "pt-1.5 text-[#475569]"
                      }`}
                    >
                      {step}
                    </p>
                  </li>
                )
              })}
            </ol>
            <LocalizedClientLink
              href={guide.href}
              className={`mt-3 py-3 ${guide.solid} text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm`}
            >
              {guide.action}
              <ArrowRightIcon className="w-4 h-4" />
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InstructionVideos
