import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRightIcon } from "@modules/layout/components/ib-icons"
import { PARTNERS } from "./partners"

type Partner = (typeof PARTNERS)[number]

const half = Math.ceil(PARTNERS.length / 2)
const ROWS: { items: Partner[]; className: string }[] = [
  { items: PARTNERS.slice(0, half), className: "marquee-left" },
  { items: PARTNERS.slice(half), className: "marquee-right" },
]

const Tile = ({ partner, hidden }: { partner: Partner; hidden: boolean }) => (
  <LocalizedClientLink
    href={`/search?q=${encodeURIComponent(partner.name)}`}
    aria-hidden={hidden || undefined}
    tabIndex={hidden ? -1 : undefined}
    title={partner.name}
    className="group shrink-0 w-[148px] mx-2 bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:border-[#7aba0c] hover:shadow-[0_8px_20px_rgba(77,124,15,0.14)] hover:-translate-y-0.5 transition-all overflow-hidden"
  >
    {/* The source logos carry a thin grey frame; the slight zoom crops it. */}
    <div className="h-[76px] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={partner.logo}
        alt={hidden ? "" : `${partner.name} logo`}
        loading="lazy"
        className="w-full h-full object-cover scale-110 grayscale-[35%] group-hover:grayscale-0 transition"
      />
    </div>
    <div className="px-2 py-2 text-[11px] font-bold text-center text-[#0f172a] truncate group-hover:text-[#4d7c0f]">
      {partner.name}
    </div>
  </LocalizedClientLink>
)

const GlobalPartners = () => (
  <section className="relative overflow-hidden bg-white pt-12 pb-14 border-t border-gray-100">
    <div className="max-w-2xl mx-auto px-6 mb-8 text-center">
      <div className="text-xs font-bold text-[#4d7c0f] uppercase tracking-widest mb-2">
        Our Trusted Brands
      </div>
      <h2 className="text-2xl sm:text-[28px] font-bold text-[#0f172a] tracking-tight">
        Partnered with Global Leaders
      </h2>
      <p className="text-sm sm:text-[15px] text-[#64748b] mt-2">
        Trusted by manufacturers across India, sourcing from{" "}
        {PARTNERS.length}+ food and nutra brands.
      </p>
    </div>

    <div className="space-y-4 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
      {ROWS.map((row) => (
        <div key={row.className} className="overflow-x-auto no-scrollbar motion-safe:overflow-hidden">
          {/* Rendered twice so the -50% scroll loops seamlessly. */}
          <div className={`${row.className} flex w-max py-1`}>
            {[...row.items, ...row.items].map((p, i) => (
              <Tile key={`${p.name}-${i}`} partner={p} hidden={i >= row.items.length} />
            ))}
          </div>
        </div>
      ))}
    </div>

    <div className="mt-8 text-center">
      <LocalizedClientLink
        href="/store"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4d7c0f] hover:text-[#3f6212]"
      >
        Browse all ingredients <ArrowRightIcon className="w-4 h-4" />
      </LocalizedClientLink>
    </div>
  </section>
)

export default GlobalPartners
