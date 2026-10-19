// ISO 3166-2:IN codes, lower-case with the country prefix ("in-ka"). The
// backend's india-gst tax provider compares exactly this value against the
// seller's state to pick CGST+SGST or IGST, so a free-text state never works.
export const INDIAN_STATES: { code: string; name: string }[] = [
  { code: "in-an", name: "Andaman and Nicobar Islands" },
  { code: "in-ap", name: "Andhra Pradesh" },
  { code: "in-ar", name: "Arunachal Pradesh" },
  { code: "in-as", name: "Assam" },
  { code: "in-br", name: "Bihar" },
  { code: "in-ch", name: "Chandigarh" },
  { code: "in-cg", name: "Chhattisgarh" },
  { code: "in-dh", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "in-dl", name: "Delhi" },
  { code: "in-ga", name: "Goa" },
  { code: "in-gj", name: "Gujarat" },
  { code: "in-hr", name: "Haryana" },
  { code: "in-hp", name: "Himachal Pradesh" },
  { code: "in-jk", name: "Jammu and Kashmir" },
  { code: "in-jh", name: "Jharkhand" },
  { code: "in-ka", name: "Karnataka" },
  { code: "in-kl", name: "Kerala" },
  { code: "in-la", name: "Ladakh" },
  { code: "in-ld", name: "Lakshadweep" },
  { code: "in-mp", name: "Madhya Pradesh" },
  { code: "in-mh", name: "Maharashtra" },
  { code: "in-mn", name: "Manipur" },
  { code: "in-ml", name: "Meghalaya" },
  { code: "in-mz", name: "Mizoram" },
  { code: "in-nl", name: "Nagaland" },
  { code: "in-od", name: "Odisha" },
  { code: "in-py", name: "Puducherry" },
  { code: "in-pb", name: "Punjab" },
  { code: "in-rj", name: "Rajasthan" },
  { code: "in-sk", name: "Sikkim" },
  { code: "in-tn", name: "Tamil Nadu" },
  { code: "in-tg", name: "Telangana" },
  { code: "in-tr", name: "Tripura" },
  { code: "in-up", name: "Uttar Pradesh" },
  { code: "in-uk", name: "Uttarakhand" },
  { code: "in-wb", name: "West Bengal" },
]

export const provinceName = (code?: string | null) =>
  INDIAN_STATES.find((s) => s.code === code?.toLowerCase())?.name ?? code ?? ""
