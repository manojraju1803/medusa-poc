import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl shadow-sm py-20 px-4 text-center"
      data-testid="empty-cart-message"
    >
      <div className="w-16 h-16 bg-[#f0fdf4] rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-[#166534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <h3 className="font-bold text-[#0f172a] mb-1">Your cart is empty</h3>
      <p className="text-sm text-[#64748b] mb-4">
        Browse our catalogue and add ingredients to get started.
      </p>
      <LocalizedClientLink
        href="/store"
        className="inline-block px-5 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-sm rounded-xl transition-colors"
      >
        Browse Ingredients
      </LocalizedClientLink>
    </div>
  )
}

export default EmptyCartMessage
