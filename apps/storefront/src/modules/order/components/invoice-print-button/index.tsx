"use client"

// Browser print dialog; "Save as PDF" there downloads the invoice.
const PrintButton = () => (
  <button
    type="button"
    onClick={() => window.print()}
    className="px-4 py-2 bg-[#166534] hover:bg-[#14532d] text-white text-sm font-bold rounded-lg"
    data-testid="print-invoice-button"
  >
    Download / Print PDF
  </button>
)

export default PrintButton
