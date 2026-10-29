import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Opens the printable tax invoice in a new tab.
const InvoiceButton = ({ orderId }: { orderId: string }) => (
  <LocalizedClientLink
    href={`/invoice/${orderId}`}
    target="_blank"
    rel="noopener"
    className="px-3 py-1.5 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold rounded-lg transition-colors"
    data-testid="download-invoice-button"
  >
    Download invoice
  </LocalizedClientLink>
)

export default InvoiceButton
