import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="py-20 px-4 flex flex-col justify-center items-center text-center max-w-lg mx-auto bg-white rounded-2xl border border-gray-200/80 shadow-xs my-8"
      data-testid="empty-cart-message"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center text-3xl mb-4 shadow-xs">
        🛒
      </div>
      <h1 className="text-2xl font-extrabold text-[#0f172a] mb-2">
        Your Wholesale Cart is Empty
      </h1>
      <p className="text-sm text-[#64748b] max-w-sm mb-6 leading-relaxed">
        Browse our extensive catalog of lab-certified raw ingredients, amino acids, proteins, and specialty additives.
      </p>
      <LocalizedClientLink
        href="/store"
        className="px-6 py-3 rounded-xl bg-[#1C94D2] hover:bg-[#0284c7] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
      >
        <span>Explore Product Catalog</span>
        <span>→</span>
      </LocalizedClientLink>
    </div>
  )
}

export default EmptyCartMessage
