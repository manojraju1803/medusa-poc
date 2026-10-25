import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { Supplier } from "../data"
import SupplierLogo from "./supplier-logo"

const SupplierCard = ({ supplier }: { supplier: Supplier }) => (
  <div
    className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:border-[#4d7c0f]/25 hover:shadow-md transition-all flex flex-col"
    data-testid="supplier-card"
  >
    <div className="flex items-center gap-3 mb-3">
      <SupplierLogo supplier={supplier} />
      <div className="min-w-0">
        <p className="text-sm font-bold text-[#0f172a] truncate">
          {supplier.title}
        </p>
        {supplier.country && (
          <p className="text-[11px] text-[#64748b]">{supplier.country}</p>
        )}
      </div>
    </div>
    <div className="flex gap-2 mb-3">
      <div className="flex-1 py-1.5 bg-[#fafdf5] rounded-lg border border-gray-100 text-center">
        <div className="text-sm font-extrabold text-[#4d7c0f]">
          {supplier.productCount}
        </div>
        <div className="text-[10px] text-[#64748b]">
          {supplier.productCount === 1 ? "Product" : "Products"}
        </div>
      </div>
    </div>
    {supplier.description && (
      <p className="text-xs text-[#64748b] leading-relaxed line-clamp-2 mb-3">
        {supplier.description}
      </p>
    )}
    <div className="flex gap-2 mt-auto">
      <LocalizedClientLink
        href={`/collections/${supplier.handle}`}
        className="flex-1 py-2 bg-[#4d7c0f] text-white text-xs font-bold rounded-lg hover:bg-[#3f6212] transition-colors text-center"
      >
        View Profile
      </LocalizedClientLink>
      <LocalizedClientLink
        href={`/contact?subject=${encodeURIComponent(`Enquiry about ${supplier.title}`)}`}
        className="flex-1 py-2 border border-[#4d7c0f]/40 text-[#4d7c0f] text-xs font-bold rounded-lg hover:bg-[#f6fbee] transition-colors text-center"
      >
        Contact
      </LocalizedClientLink>
    </div>
  </div>
)

export default SupplierCard
