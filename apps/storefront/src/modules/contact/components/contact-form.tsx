"use client"

import { useState } from "react"
import { submitInquiry } from "@lib/data/inquiries"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CATEGORIES = [
  "General Inquiries",
  "Partnerships",
  "Supplier Support",
  "Buyer Support",
  "Technical Support",
  "Media & Press",
]

const inputClass =
  "mt-1 w-full px-3 py-2 text-sm text-[#0f172a] border border-gray-200 rounded-xl outline-none focus:border-[#006B4F] bg-white"
const labelClass =
  "text-[10px] font-bold text-[#64748b] uppercase tracking-wide"

const ContactForm = ({ defaultSubject = "" }: { defaultSubject?: string }) => {
  const [category, setCategory] = useState(CATEGORIES[0])
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const text = (k: string) => ((fd.get(k) as string) || "").trim()
    setError(null)
    setStatus("sending")
    try {
      const res = await submitInquiry({
        type: "contact",
        name: text("name"),
        email: text("email"),
        phone: text("phone") || undefined,
        company: text("company") || undefined,
        message: text("message"),
        metadata: { subject: text("subject") || undefined, category },
      })
      if (!res.ok) throw new Error(res.error)
      setStatus("sent")
    } catch {
      setStatus("idle")
      setError("Sorry, we couldn't send your message. Please try again.")
    }
  }

  if (status === "sent") {
    return (
      <div
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center"
        data-testid="contact-success"
      >
        <div className="w-16 h-16 bg-[#f0fdf4] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#006B4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-[#0f172a] mb-2">
          Message Sent!
        </h2>
        <p className="text-sm text-[#64748b] mb-5">
          Our team will get back to you within 24 hours.
        </p>
        <LocalizedClientLink
          href="/"
          className="inline-block px-5 py-2.5 bg-[#006B4F] text-white font-semibold text-sm rounded-xl hover:bg-[#005a42] transition-colors"
        >
          Back to Home
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 h-fit">
        <h3 className="text-xs font-bold text-[#0f172a] mb-3">
          Contact Us About
        </h3>
        <nav className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`w-full text-left px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${
                category === cat
                  ? "bg-[#006B4F] text-white"
                  : "text-[#374151] hover:bg-[#f0fdf4] hover:text-[#006B4F]"
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6"
        data-testid="contact-form"
      >
        <h3 className="text-lg font-extrabold text-[#0f172a] mb-1">
          Send Us a Message
        </h3>
        <p className="text-xs text-[#64748b] mb-5">
          Re: <strong>{category}</strong>
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className={labelClass}>Full Name *</span>
              <input name="name" required placeholder="Your name" className={inputClass} autoComplete="name" />
            </label>
            <label className="block">
              <span className={labelClass}>Company Name</span>
              <input name="company" placeholder="Your company" className={inputClass} autoComplete="organization" />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className={labelClass}>Email *</span>
              <input name="email" type="email" required placeholder="you@company.com" className={inputClass} autoComplete="email" />
            </label>
            <label className="block">
              <span className={labelClass}>Phone</span>
              <input name="phone" type="tel" placeholder="+91 98765 43210" className={inputClass} autoComplete="tel" />
            </label>
          </div>
          <label className="block">
            <span className={labelClass}>Subject</span>
            <input
              name="subject"
              defaultValue={defaultSubject}
              placeholder={`${category} — how can we help?`}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Message *</span>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Describe your inquiry in detail…"
              className={`${inputClass} resize-none`}
            />
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" required className="mt-0.5 w-4 h-4 accent-[#006B4F]" />
            <span className="text-xs text-[#64748b]">
              I agree to the{" "}
              <span className="text-[#006B4F] font-semibold">Privacy Policy</span>{" "}
              and consent to being contacted by Ingredients Bazar.
            </span>
          </label>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full py-3 bg-[#006B4F] hover:bg-[#005a42] disabled:opacity-70 text-white font-bold text-sm rounded-xl transition-colors"
            data-testid="contact-submit"
          >
            {status === "sending" ? "Sending…" : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ContactForm
