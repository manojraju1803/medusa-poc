type Testimonial = {
  quote: string
  name: string
  role: string
  company: string
  // Star rating out of 5; omit to hide the stars.
  rating?: number
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
    rating: 5,
    sample: true,
  },
  {
    quote:
      "COA and spec sheets come with every order, which makes our QA sign-off straightforward for every new batch.",
    name: "Customer name",
    role: "Quality Head",
    company: "Bakery manufacturer",
    rating: 5,
    sample: true,
  },
  {
    quote:
      "Same-day dispatch from Bengaluru has kept our lines running more than once. Comparing brands side by side is a big plus.",
    name: "Customer name",
    role: "Founder",
    company: "Sports nutrition brand",
    rating: 5,
    sample: true,
  },
]

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5 text-[#f59e0b]" role="img" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-3.5 h-3.5 ${i < rating ? "" : "opacity-25"}`}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.3a1 1 0 00.95.69h3.47c.97 0 1.37 1.24.59 1.81l-2.81 2.04a1 1 0 00-.36 1.12l1.07 3.3c.3.92-.75 1.69-1.54 1.12l-2.8-2.04a1 1 0 00-1.18 0l-2.8 2.04c-.8.57-1.84-.2-1.55-1.12l1.08-3.3a1 1 0 00-.37-1.12L2.97 8.73c-.78-.57-.38-1.81.59-1.81h3.47a1 1 0 00.95-.69l1.07-3.3z" />
      </svg>
    ))}
  </div>
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
    <section className="bg-[#f0fdf4] py-12 border-y border-[#dcfce7]">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-[28px] font-bold text-[#0f172a] tracking-tight">
            What Our Clients Say
          </h2>
          <p className="text-sm sm:text-[15px] text-[#64748b] mt-2">
            Trusted by manufacturers and brands across India
          </p>
        </div>

        <ul className="grid md:grid-cols-3 gap-5 items-stretch">
          {visible.map((t, i) => (
            <li
              key={`${t.role}-${i}`}
              className="relative flex flex-col bg-white rounded-xl border border-white hover:border-[#bbf7d0] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.05)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-all"
            >
              {t.sample && (
                <span className="absolute top-4 right-4 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold uppercase tracking-wider">
                  Sample
                </span>
              )}
              {t.rating ? <Stars rating={t.rating} /> : null}
              <blockquote className="mt-4 flex-1 text-sm sm:text-[15px] italic leading-relaxed text-[#334155]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-5 flex items-center gap-3">
                <span className="w-9 h-9 shrink-0 rounded-full bg-[#166534] text-white flex items-center justify-center text-xs font-bold">
                  {initials(t.name)}
                </span>
                <div className="min-w-0">
                  <div className="text-sm sm:text-[15px] font-bold text-[#0f172a]">{t.name}</div>
                  <div className="text-[11px] text-[#64748b]">
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Testimonials
