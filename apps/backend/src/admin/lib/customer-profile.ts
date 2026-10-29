// Registration fields as the admin shows and edits them. Mirrors the
// storefront's `lib/util/registration.ts`; keep the two in step.

export type AccountType = "buyer" | "rnd" | "supplier"

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  buyer: "Buyer",
  rnd: "R&D",
  supplier: "Supplier",
}

export const accountTypeOf = (metadata: unknown): AccountType => {
  const value = (metadata as Record<string, unknown> | null)?.account_type
  return value === "rnd" || value === "supplier" ? value : "buyer"
}

const COMPANY_NATURES = [
  "Private Limited Company",
  "Public Limited Company",
  "Partnership Firm",
  "Limited Liability Partnership",
  "Proprietorship",
  "Other",
]

const BUSINESS_NATURES = ["Manufacturer", "Distributor", "Importer", "Exporter", "Trader", "Agent"]

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
]

export type FieldDef = {
  key: string
  label: string
  options?: string[]
  textarea?: boolean
  required?: boolean
  // Stored on the customer record itself rather than in metadata.
  column?: "company_name" | "phone" | "contact_person"
}

const F: Record<string, FieldDef> = {
  company_name: { key: "company_name", label: "Company name", column: "company_name" },
  company_nature: { key: "company_nature", label: "Nature of company", options: COMPANY_NATURES, required: true },
  registered_address: { key: "registered_address", label: "Registered office address", textarea: true },
  warehouse_address: { key: "warehouse_address", label: "Warehouse / plant address", textarea: true, required: true },
  city: { key: "city", label: "City" },
  state: { key: "state", label: "State", options: INDIAN_STATES, required: true },
  postcode: { key: "postcode", label: "PIN code", required: true },
  gst_number: { key: "gst_number", label: "GST number", required: true },
  fssai_number: { key: "fssai_number", label: "FSSAI licence number" },
  contact_person: { key: "contact_person", label: "Contact person", column: "contact_person", required: true },
  designation: { key: "designation", label: "Designation" },
  mobile: { key: "mobile", label: "Mobile number", column: "phone" },
  telephone: { key: "telephone", label: "Telephone number" },
  contact_address: { key: "contact_address", label: "Contact person address", textarea: true },
  business_nature: { key: "business_nature", label: "Nature of business", options: BUSINESS_NATURES, required: true },
  brand_name: { key: "brand_name", label: "Brand name", required: true },
  ingredient_name: { key: "ingredient_name", label: "Ingredient name", required: true },
}

export type Section = { key: string; title: string; fields: FieldDef[] }

export const sectionsFor = (type: AccountType): Section[] =>
  type === "supplier"
    ? [
        {
          key: "company",
          title: "Company details",
          fields: [
            { ...F.company_name, required: true },
            F.company_nature,
            { ...F.registered_address, required: true },
            F.warehouse_address,
            F.gst_number,
            F.fssai_number,
          ],
        },
        { key: "business", title: "Business details", fields: [F.business_nature, F.brand_name, F.ingredient_name] },
        { key: "contact", title: "Contact numbers", fields: [{ ...F.mobile, required: true }, F.telephone] },
      ]
    : [
        {
          key: "company",
          title: "Company details",
          fields: [
            F.company_name,
            F.company_nature,
            F.registered_address,
            F.city,
            F.state,
            F.postcode,
            F.gst_number,
            F.fssai_number,
          ],
        },
        {
          key: "contact",
          title: "Contact person",
          fields: [F.contact_person, F.designation, F.mobile, F.telephone, F.contact_address],
        },
      ]

export type Values = Record<string, string>

type CustomerLike = {
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  company_name?: string | null
  metadata?: Record<string, unknown> | null
}

export const valuesOf = (customer: CustomerLike): Values => {
  const values: Values = {}
  for (const [key, value] of Object.entries(customer.metadata ?? {})) {
    if (typeof value === "string") values[key] = value
  }
  values.company_name = customer.company_name ?? ""
  values.contact_person = [customer.first_name, customer.last_name].filter(Boolean).join(" ")
  values.mobile = customer.phone ?? ""
  return values
}

const RULES: Record<string, [RegExp, string]> = {
  mobile: [/^[6-9][0-9]{9}$/, "10 digits, starting with 6, 7, 8 or 9."],
  telephone: [/^[0-9]{10,12}$/, "10 to 12 digits, with STD code."],
  postcode: [/^[1-9][0-9]{5}$/, "6-digit PIN code."],
  gst_number: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "15-character GSTIN, e.g. 22AAAAA0000A1Z5."],
  fssai_number: [/^[0-9]{14}$/, "14 digits."],
  contact_person: [/^[A-Za-z][A-Za-z .'-]+$/, "Letters, spaces, dots, apostrophes or hyphens."],
  city: [/^[A-Za-z][A-Za-z .-]+$/, "Letters only."],
}

export const normalize = (key: string, raw: string) => {
  const v = raw.trim().replace(/\s+/g, " ")
  if (key === "gst_number") return v.toUpperCase()
  if (["mobile", "telephone", "postcode", "fssai_number"].includes(key)) return v.replace(/\D/g, "")
  return v
}

export const validate = (fields: FieldDef[], values: Values) => {
  const errors: Record<string, string> = {}
  for (const f of fields) {
    const v = normalize(f.key, values[f.key] ?? "")
    if (!v) {
      if (f.required) errors[f.key] = "Required."
      continue
    }
    const rule = RULES[f.key]
    if (rule && !rule[0].test(v)) errors[f.key] = rule[1]
    else if (f.options && !f.options.includes(v)) errors[f.key] = "Choose an option from the list."
    else if (f.textarea && v.length < 10) errors[f.key] = "At least 10 characters."
  }
  return errors
}

// The admin customer-update body for one saved section.
export const updateBody = (
  fields: FieldDef[],
  values: Values,
  metadata: Record<string, unknown>
) => {
  const body: Record<string, unknown> = {}
  const nextMeta = { ...metadata }
  for (const f of fields) {
    const v = normalize(f.key, values[f.key] ?? "")
    if (f.column === "company_name") body.company_name = v || null
    else if (f.column === "phone") body.phone = v || null
    else if (f.column === "contact_person") {
      const [first, ...rest] = v.split(" ")
      body.first_name = first || null
      body.last_name = rest.join(" ") || null
    } else if (v) nextMeta[f.key] = v
    else delete nextMeta[f.key]
  }
  body.metadata = nextMeta
  return body
}

// Documents are stored privately and listed by their key in the documents
// bucket; one definition for the backend and the admin. One saved before
// storage moved to S3 has no key until the move script has secured it.
export { listedDocumentsOf as documentsOf, documentType } from "../../api/utils/document-files"
export type { ListedDocument as StoredDocument } from "../../api/utils/document-files"

export const QUALITY_DOCUMENTS = [
  "Specification Sheet",
  "COA Form",
  "MSDS Form",
  "Non-GMO",
  "Melamine Free Certificate",
  "ISO 22000/HACCP Form",
  "Kosher Certificate",
  "Halal Certificate",
]

