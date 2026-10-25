// GST invoices aren't generated yet; the button is shown disabled so buyers
// know where it will live.
const InvoiceButton = () => (
  <span className="relative group inline-flex" title="Coming soon">
    <button
      type="button"
      disabled
      aria-disabled
      className="px-3 py-1.5 bg-[#4d7c0f] text-white text-xs font-bold rounded-lg opacity-50 cursor-not-allowed"
      data-testid="download-invoice-button"
    >
      Download invoice
    </button>
    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-[#0f172a] px-2 py-1 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
      Coming soon
    </span>
  </span>
)

export default InvoiceButton
