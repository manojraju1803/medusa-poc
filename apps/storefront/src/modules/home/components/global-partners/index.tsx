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
    className="group shrink-0 w-[132px] mx-2 bg-white rounded-2xl border-2 border-[#dcebc6] shadow-[0_4px_12px_rgba(0,53,110,0.06)] hover:border-[#7aba0c] hover:shadow-[0_10px_24px_rgba(77,124,15,0.16)] hover:-translate-y-0.5 transition-all overflow-hidden"
  >
    {/* The source logos carry a thin grey frame; the slight zoom crops it. */}
    <div className="h-[92px] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={partner.logo}
        alt={hidden ? "" : `${partner.name} logo`}
        loading="lazy"
        className="w-full h-full object-cover scale-110 grayscale-[35%] group-hover:grayscale-0 transition"
      />
    </div>
    <div className="px-2 py-1.5 border-t border-[#e6f2d6] text-[10px] font-bold text-center text-[#334155] truncate group-hover:text-[#4d7c0f]">
      {partner.name}
    </div>
  </LocalizedClientLink>
)

const GlobalPartners = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#f4f9fd] py-14 border-y border-[#e6f2d6]">
    <div className="max-w-[1440px] mx-auto px-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <div className="text-xs font-bold text-[#0077cf] uppercase tracking-wider mb-2">
          Our Global Partners
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
          {PARTNERS.length}+ brands, one marketplace
        </h2>
        <p className="text-sm text-[#64748b] mt-1">
          Multi-brand food and nutra ingredients from leading manufacturers in
          India and around the world.
        </p>
      </div>
      <LocalizedClientLink
        href="/store"
        className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[#4d7c0f] hover:text-[#3f6212]"
      >
        Browse all ingredients <ArrowRightIcon className="w-4 h-4" />
      </LocalizedClientLink>
    </div>

    <div className="space-y-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
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
  </section>
)

export default GlobalPartners
