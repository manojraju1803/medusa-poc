import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronRightIcon } from "@modules/layout/components/ib-icons"

const SectionHeader = ({
  title,
  desc,
  viewAllHref,
}: {
  title: string
  desc?: string
  viewAllHref?: string
}) => (
  <div className="flex items-start justify-between mb-6 gap-4">
    <div>
      <h2 className="text-2xl font-bold text-[#0f172a] mb-1">{title}</h2>
      {desc && <p className="text-sm text-[#64748b]">{desc}</p>}
    </div>
    {viewAllHref && (
      <LocalizedClientLink
        href={viewAllHref}
        className="shrink-0 flex items-center gap-1 text-sm font-semibold text-[#006B4F] hover:text-[#005a42] transition-colors mt-1"
      >
        View All <ChevronRightIcon className="w-4 h-4" />
      </LocalizedClientLink>
    )}
  </div>
)

export default SectionHeader
