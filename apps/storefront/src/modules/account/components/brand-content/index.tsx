// Marketing content from the Ingredients Bazar brochure, used on the sign-in
// page (and the supplier services list on supplier registration).

export const PLATFORM_TAGLINE = "World's first multibrand ingredients e-commerce platform"

export const PLATFORM_INTRO =
  "ingredientsbazar.com is a startup multi-brand ingredients e-commerce platform for the Food & Nutra industry."

const STATS = [
  { value: "21", label: "Categories" },
  { value: "150", label: "Companies" },
  { value: "350", label: "Brands" },
  { value: "150", label: "Ingredients" },
  { value: "50", label: "Indian Companies" },
] as const

export const SUPPLIER_SERVICES = [
  "Targeted exhibiting",
  "Digital marketing plan",
  "Trade-show participation",
  "Strong marketing strategy",
  "Customer visits by experienced executives",
  "Qualified and experienced sales and customer service team",
  "Boost your ingredients' and brand's visibility with our promotional programmes",
]

const VISION =
  "To become the most preferable, reliable and competitively priced source of best-quality multi-brand ingredients for the Food and Nutra industry."

const MISSION =
  "To support our customers by creating value and exceeding their expectations through market leadership and operational excellence, and so become one of the leading global distributors and suppliers of best-quality multi-brand ingredients for the Nutra and Food industry."

// Compact stat chips for the dark sign-in banner.
export const StatChips = () => (
  <dl className="flex flex-wrap items-end gap-y-3">
    {STATS.map((s, i) => (
      <div
        key={s.label}
        className={`pr-4 mr-4 ${i < STATS.length - 1 ? "border-r border-white/20" : ""}`}
      >
        <dt className="sr-only">{s.label}</dt>
        <dd className="text-2xl font-extrabold leading-none text-white tabular-nums">
          {s.value}
        </dd>
        <dd className="mt-1 text-[11px] font-medium text-white/60">{s.label}</dd>
      </div>
    ))}
  </dl>
)

// The same six features as icon cards, for the dark sign-in banner.
const FEATURE_DETAILS: { title: string; text: string; icon: string }[] = [
  {
    title: "Save energy & time",
    text: "Every brand you need, in one place",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    title: "Same day dispatch",
    text: "On orders paid before 2 PM",
    icon: "M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.6a1 1 0 01.7.3l3.4 3.4a1 1 0 01.3.7V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1",
  },
  {
    title: "Live inventory detail",
    text: "Real stock, warehouse by warehouse",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    title: "Slab-wise price",
    text: "Better rates as quantity grows",
    icon: "M7 7h.01M7 3h5a1.99 1.99 0 011.4.6l7 7a2 2 0 010 2.8l-7 7a2 2 0 01-2.8 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z",
  },
  {
    title: "Comparison",
    text: "Brands and specs side by side",
    icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  },
  {
    title: "Documents",
    text: "COA, spec sheets and certificates",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6a1 1 0 01.7.3l5.4 5.4a1 1 0 01.3.7V19a2 2 0 01-2 2z",
  },
]

export const FeatureCards = () => (
  <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
    {FEATURE_DETAILS.map((f) => (
      <li key={f.title} title={f.text} className="flex items-center gap-2.5 text-sm text-white/90">
        <svg className="w-4 h-4 shrink-0 text-[#4ade80]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
        </svg>
        {f.title}
      </li>
    ))}
  </ul>
)

// Vision and mission side by side, for the dark sign-in banner.
export const VisionMission = () => (
  <dl className="space-y-3 border-l-2 border-[#4ade80] pl-4">
    {[
      { label: "Our Vision", text: VISION },
      { label: "Our Mission", text: MISSION },
    ].map((b) => (
      <div key={b.label}>
        <dt className="text-[11px] font-bold uppercase tracking-widest text-[#4ade80]">{b.label}</dt>
        <dd className="mt-0.5 text-xs leading-relaxed text-white/70">{b.text}</dd>
      </div>
    ))}
  </dl>
)

export const SupplierServicesList = () => (
  <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
    {SUPPLIER_SERVICES.map((item) => (
      <li key={item} className="flex gap-2.5 text-sm text-[#334155]">
        <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-[#4ade80] text-[#052e16] flex items-center justify-center" aria-hidden="true">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
        {item}
      </li>
    ))}
  </ul>
)
