// The seller's registered details, printed on every tax invoice.
export const SELLER = {
  name: "SAISUKRITHKAR SUPPLEMENTS PVT LTD",
  legalName: "Saisukrithkar Supplements Private Limited",
  address: [
    "#84/1, Near Rockwood Green Public School,",
    "C.K Palya Main Road, Basavanapura, Bannerughatta Road,",
    "Bengaluru-83, Karnataka, Bharat.",
  ],
  phone: "+91 90350 22477",
  email: "ingredientsbazar@gmail.com",
  gstin: "29AAZCS9077K1ZZ",
  pan: "AAZCS9077K",
  fssai: "11221999000332",
  udyam: "UDYAM-KR-03-0061501",
  jurisdiction: "Bangalore",
}

export const INVOICE_TERMS = [
  "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct",
  "Goods once sold cannot be taken back or exchanged",
  "No Claim will be entertained in invoice if discrepancy is notified beyond 30 days.",
  "Our responsibility ceases once the goods leave our godown or handed over to buyer's transporters",
  "E & O.E",
  `Any dispute will be subject to ${SELLER.jurisdiction} jurisdiction only`,
]
