type Testimonial = {
  quote: string
  name: string
  role: string
  company: string
  // Placeholder copy. Samples render only outside production and are marked
  // on the page, so invented reviews never reach real buyers.
  sample?: boolean
}

// Replace these with real customer quotes (with their permission) and drop
// the `sample` flag to publish the section.
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Slab pricing and live stock in one place means our purchase team quotes production runs in minutes instead of chasing three distributors.",
    name: "Customer name",
    role: "Procurement Manager",
    company: "Nutraceutical manufacturer",
    sample: true,
  },
  {
    quote:
      "COA and spec sheets come with every order, which makes our QA sign-off straightforward for every new batch.",
    name: "Customer name",
    role: "Quality Head",
    company: "Bakery manufacturer",
    sample: true,
  },
  {
    quote:
      "Same-day dispatch from Bengaluru has kept our lines running more than once. Comparing brands side by side is a big plus.",
    name: "Customer name",
    role: "Founder",
    company: "Sports nutrition brand",
    sample: true,
  },
]

const QuoteMark = () => (
  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M12.5 7C7.3 9.3 4 13.6 4 18.8 4 23 6.6 26 10.2 26c3 0 5.3-2.3 5.3-5.2 0-2.9-2.1-5-4.9-5-.5 0-1 .1-1.3.2.6-2.7 3-5.4 5.6-6.7L12.5 7zm14 0c-5.2 2.3-8.5 6.6-8.5 11.8 0 4.2 2.6 7.2 6.2 7.2 3 0 5.3-2.3 5.3-5.2 0-2.9-2.1-5-4.9-5-.5 0-1 .1-1.3.2.6-2.7 3-5.4 5.6-6.7L26.5 7z" />
  </svg>
)

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

const Testimonials = () => {
  const visible =
    process.env.NODE_ENV === "production"
      ? TESTIMONIALS.filter((t) => !t.sample)
      : TESTIMONIALS
  if (!visible.length) return null

  return (
    <section className="relative overflow-hidden bg-[#f6fbee] py-16 border-y border-[#e6f2d6]">
      <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-[#0077cf]/10 blur-3xl" aria-hidden="true" />
      <div className="relative max-w-[1240px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-bold text-[#4d7c0f] uppercase tracking-wider mb-2">
            Testimonials
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
            What our buyers say
          </h2>
          <p className="text-sm text-[#64748b] mt-2">
            Manufacturers and brands across India source with Ingredients Bazar.
          </p>
        </div>

        <ul className="grid md:grid-cols-3 gap-5 items-stretch">
          {visible.map((t, i) => {
            const featured = i === 1
            return (
              <li
                key={`${t.role}-${i}`}
                className={`relative flex flex-col rounded-2xl p-6 transition-all ${
                  featured
                    ? "bg-gradient-to-br from-[#00356e] to-[#0062ab] text-white shadow-[0_18px_40px_rgba(0,53,110,0.25)] md:-translate-y-3"
                    : "bg-white border-2 border-[#dcebc6] shadow-[0_4px_14px_rgba(0,53,110,0.07)]"
                }`}
              >
                {t.sample && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold uppercase tracking-wider">
                    Sample
                  </span>
                )}
                <span className={featured ? "text-[#7aba0c]" : "text-[#7aba0c]/70"}>
                  <QuoteMark />
                </span>
                <blockquote
                  className={`mt-3 flex-1 text-sm leading-relaxed ${
                    featured ? "text-white/90" : "text-[#334155]"
                  }`}
                >
                  {t.quote}
                </blockquote>
                <div
                  className={`mt-5 pt-4 flex items-center gap-3 border-t ${
                    featured ? "border-white/15" : "border-[#e6f2d6]"
                  }`}
                >
                  <span
                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-xs font-extrabold ${
                      featured ? "bg-[#7aba0c] text-[#00254d]" : "bg-[#0077cf] text-white"
                    }`}
                  >
                    {initials(t.name)}
                  </span>
                  <div className="min-w-0">
                    <div className={`text-sm font-bold ${featured ? "text-white" : "text-[#0f172a]"}`}>
                      {t.name}
                    </div>
                    <div className={`text-[11px] ${featured ? "text-white/70" : "text-[#64748b]"}`}>
                      {t.role}, {t.company}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export default Testimonials
