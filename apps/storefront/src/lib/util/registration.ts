// Registration rules shared by the sign-up forms (instant feedback) and the
// `registerAccount` server action (the authoritative check).

export type AccountRole = "buyer" | "rnd" | "supplier"

export const ACCOUNT_ROLES: AccountRole[] = ["buyer", "rnd", "supplier"]

export const parseRole = (value: unknown): AccountRole =>
  ACCOUNT_ROLES.includes(value as AccountRole) ? (value as AccountRole) : "buyer"

// Customers created before roles existed carry no `account_type`: they're buyers.
export const roleOfCustomer = (metadata: unknown): AccountRole =>
  parseRole((metadata as Record<string, unknown> | null)?.account_type)

export const ROLE_LABEL: Record<AccountRole, string> = {
  buyer: "Buyer",
  rnd: "R&D",
  supplier: "Supplier",
}

export const COMPANY_NATURES = [
  "Private Limited Company",
  "Public Limited Company",
  "Partnership Firm",
  "Limited Liability Partnership",
  "Proprietorship",
  "Other",
]

export const BUSINESS_NATURES = [
  "Manufacturer",
  "Distributor",
  "Importer",
  "Exporter",
  "Trader",
  "Agent",
]

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
]

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

export const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024
export const DOCUMENT_HINT = "PDF, Word, JPG or PNG · max 2 MB"
export const DOCUMENT_ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png"
export const DOCUMENT_MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
}

export const documentField = (index: number) => `document_${index}`

export type FieldErrors = Record<string, string>
export type FormValues = Record<string, string>

export const BUYER_FIELDS = [
  "company_name",
  "company_nature",
  "registered_address",
  "city",
  "state",
  "postcode",
  "gst_number",
  "fssai_number",
  "contact_person",
  "contact_address",
  "mobile",
  "email",
  "designation",
  "telephone",
  "confirm_email",
  "password",
  "confirm_password",
  "agreement",
] as const

export const SUPPLIER_FIELDS = [
  "company_name",
  "company_nature",
  "registered_address",
  "warehouse_address",
  "gst_number",
  "fssai_number",
  "mobile",
  "email",
  "telephone",
  "business_nature",
  "brand_name",
  "ingredient_name",
  "password",
  "confirm_password",
  "agreement",
] as const

export const fieldsForRole = (role: AccountRole): readonly string[] =>
  role === "supplier" ? SUPPLIER_FIELDS : BUYER_FIELDS

const REQUIRED: Record<"buyer" | "supplier", string[]> = {
  buyer: [
    "company_nature",
    "state",
    "postcode",
    "gst_number",
    "contact_person",
    "email",
    "confirm_email",
    "password",
    "confirm_password",
  ],
  supplier: [
    "company_name",
    "company_nature",
    "registered_address",
    "warehouse_address",
    "gst_number",
    "mobile",
    "email",
    "business_nature",
    "brand_name",
    "ingredient_name",
    "password",
    "confirm_password",
  ],
}

export const isRequired = (role: AccountRole, field: string) =>
  REQUIRED[role === "supplier" ? "supplier" : "buyer"].includes(field)

const MAX_LENGTH: Record<string, number> = {
  registered_address: 300,
  warehouse_address: 300,
  contact_address: 300,
  email: 100,
  confirm_email: 100,
  password: 128,
  confirm_password: 128,
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// Indian mobile: exactly 10 digits, starting 6-9.
const MOBILE = /^[6-9][0-9]{9}$/
// Landline with STD code, e.g. 08012345678.
const TELEPHONE = /^[0-9]{10,12}$/
const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/
const FSSAI = /^[0-9]{14}$/
const PIN_CODE = /^[1-9][0-9]{5}$/
const PERSON_NAME = /^[A-Za-z][A-Za-z .'-]*$/
const PLACE_NAME = /^[A-Za-z][A-Za-z .-]*$/
const DESIGNATION = /^[A-Za-z][A-Za-z0-9 .&/,()-]*$/
const HAS_LETTER = /[A-Za-z]/

const ADDRESS_FIELDS = ["registered_address", "warehouse_address", "contact_address"]
const MIN_ADDRESS = 10

const digits = (v: string) => v.replace(/\D/g, "")

// A pasted "+91 98765 43210" or "098765 43210" becomes the bare 10 digits.
const normalizeMobile = (v: string) => {
  const d = digits(v)
  if (d.length === 12 && d.startsWith("91")) return d.slice(2)
  if (d.length === 11 && d.startsWith("0")) return d.slice(1)
  return d
}

// Canonical form of each value, applied before validating and before saving.
export const normalizeValues = (values: FormValues): FormValues => {
  const out: FormValues = {}
  for (const [key, raw] of Object.entries(values)) {
    const v = key.includes("password") ? raw : (raw ?? "").trim()
    if (key === "gst_number") out[key] = v.toUpperCase()
    else if (key === "email" || key === "confirm_email") out[key] = v.toLowerCase()
    else if (key === "mobile") out[key] = normalizeMobile(v)
    else if (["telephone", "postcode", "fssai_number"].includes(key)) out[key] = digits(v)
    else if (key.includes("password")) out[key] = v
    else out[key] = v.replace(/\s+/g, " ")
  }
  return out
}

export const validateRegistration = (
  role: AccountRole,
  input: FormValues
): FieldErrors => {
  const v = normalizeValues(input)
  const errors: FieldErrors = {}
  const isSupplier = role === "supplier"

  for (const field of fieldsForRole(role)) {
    if (field === "agreement") continue
    const value = v[field] ?? ""
    if (!value && isRequired(role, field)) {
      errors[field] = "This field is required."
      continue
    }
    if (value.length > (MAX_LENGTH[field] ?? 200)) {
      errors[field] = "This value is too long."
    }
  }

  const check = (field: string, ok: boolean, message: string) => {
    if (v[field] && !errors[field] && !ok) errors[field] = message
  }

  check("email", EMAIL.test(v.email ?? ""), "Enter a valid e-mail address.")
  if (!isSupplier) {
    check("confirm_email", EMAIL.test(v.confirm_email ?? ""), "Enter a valid e-mail address.")
    check("confirm_email", v.confirm_email === v.email, "E-mail addresses do not match.")
    check("postcode", PIN_CODE.test(v.postcode ?? ""), "Enter a valid 6-digit PIN code.")
    check("state", INDIAN_STATES.includes(v.state ?? ""), "Select a state from the list.")
  } else {
    check(
      "business_nature",
      BUSINESS_NATURES.includes(v.business_nature ?? ""),
      "Select an option from the list."
    )
  }
  check(
    "company_nature",
    COMPANY_NATURES.includes(v.company_nature ?? ""),
    "Select an option from the list."
  )
  check("mobile", MOBILE.test(v.mobile ?? ""), "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.")
  check("telephone", TELEPHONE.test(v.telephone ?? ""), "Enter the landline with STD code, 10 to 12 digits.")
  check(
    "company_name",
    (v.company_name ?? "").length >= 2 && HAS_LETTER.test(v.company_name ?? ""),
    "Enter a valid company name."
  )
  check(
    "contact_person",
    (v.contact_person ?? "").length >= 2 && PERSON_NAME.test(v.contact_person ?? ""),
    "Use letters, spaces, dots, apostrophes or hyphens only."
  )
  check(
    "designation",
    DESIGNATION.test(v.designation ?? ""),
    "Enter a valid designation."
  )
  check(
    "city",
    (v.city ?? "").length >= 2 && PLACE_NAME.test(v.city ?? ""),
    "Enter a valid city name."
  )
  for (const field of ADDRESS_FIELDS) {
    check(
      field,
      (v[field] ?? "").length >= MIN_ADDRESS && HAS_LETTER.test(v[field] ?? ""),
      `Enter the complete address (at least ${MIN_ADDRESS} characters).`
    )
  }
  for (const field of ["brand_name", "ingredient_name"]) {
    check(
      field,
      (v[field] ?? "").length >= 2 && HAS_LETTER.test(v[field] ?? ""),
      "Enter at least 2 characters."
    )
  }
  check(
    "gst_number",
    GSTIN.test(v.gst_number ?? ""),
    "Enter a valid 15-character GSTIN, e.g. 22AAAAA0000A1Z5."
  )
  check("fssai_number", FSSAI.test(v.fssai_number ?? ""), "FSSAI licence number must be 14 digits.")
  check(
    "password",
    (v.password ?? "").length >= 8,
    "Password must contain at least 8 characters."
  )
  check(
    "password",
    /[A-Za-z]/.test(v.password ?? "") && /[0-9]/.test(v.password ?? ""),
    "Use a mix of letters and numbers."
  )
  check("confirm_password", v.confirm_password === v.password, "Passwords do not match.")

  if (!v.agreement) errors.agreement = "Please select Yes or No."
  else if (v.agreement !== "yes")
    errors.agreement = "You must agree to the terms and conditions to register."

  return errors
}

export const validateDocument = (file: File | null | undefined): string | null => {
  if (!file || !file.size) return null
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  if (!DOCUMENT_MIME_TYPES[ext]) return "Upload a PDF, Word document, JPG or PNG."
  if (file.size > MAX_DOCUMENT_BYTES) return "File must be 2 MB or smaller."
  return null
}

// ---------------------------------------------------------------------------
// Profile editing: the same fields and rules as registration, grouped into the
// sections the profile page shows and saves one at a time.

export type ProfileSection = {
  key: string
  title: string
  subtitle?: string
  fields: string[]
}

export const PROFILE_SECTIONS: Record<"buyer" | "supplier", ProfileSection[]> = {
  buyer: [
    {
      key: "company",
      title: "Company Details",
      fields: [
        "company_name",
        "company_nature",
        "registered_address",
        "city",
        "state",
        "postcode",
        "gst_number",
        "fssai_number",
      ],
    },
    {
      key: "contact",
      title: "Contact Person",
      subtitle: "Who we contact about orders and approvals.",
      fields: ["contact_person", "designation", "mobile", "telephone", "contact_address"],
    },
  ],
  supplier: [
    {
      key: "company",
      title: "Company Details",
      fields: [
        "company_name",
        "company_nature",
        "registered_address",
        "warehouse_address",
        "gst_number",
        "fssai_number",
      ],
    },
    {
      key: "business",
      title: "Business Details",
      fields: ["business_nature", "brand_name", "ingredient_name"],
    },
    {
      key: "contact",
      title: "Contact Numbers",
      fields: ["mobile", "telephone"],
    },
  ],
}

export const profileSectionsFor = (role: AccountRole) =>
  PROFILE_SECTIONS[role === "supplier" ? "supplier" : "buyer"]

// Fields stored on the customer record itself rather than in metadata.
export const TOP_LEVEL_FIELDS = ["company_name", "contact_person", "mobile"]

type ProfileSource = {
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  company_name?: string | null
  metadata?: Record<string, unknown> | null
}

// The registration form values a customer record represents.
export const profileValues = (customer: ProfileSource): FormValues => {
  const meta = (customer.metadata ?? {}) as Record<string, unknown>
  const values: FormValues = {}
  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === "string") values[key] = value
  }
  values.company_name = customer.company_name ?? ""
  values.contact_person = [customer.first_name, customer.last_name]
    .filter(Boolean)
    .join(" ")
  values.mobile = customer.phone ?? ""
  values.email = customer.email ?? ""
  return values
}

// Validates only `fields`, with the registration rules. Fields the profile
// never edits (password, terms, e-mail) get valid placeholders.
export const validateFields = (
  role: AccountRole,
  values: FormValues,
  fields: readonly string[]
): FieldErrors => {
  const all = validateRegistration(role, {
    ...values,
    confirm_email: values.email ?? "",
    password: "placeholder1",
    confirm_password: "placeholder1",
    agreement: "yes",
  })
  return Object.fromEntries(
    Object.entries(all).filter(([field]) => fields.includes(field))
  )
}

export const FIELD_LABELS: Record<string, string> = {
  company_name: "Company Name",
  company_nature: "Nature of Company",
  registered_address: "Registered Office Address",
  warehouse_address: "Warehouse/Plant Address",
  city: "City Name",
  state: "State Name",
  postcode: "PIN Code",
  gst_number: "GST Number",
  fssai_number: "FSSAI Licence Number",
  contact_person: "Contact Person",
  designation: "Designation",
  mobile: "Mobile Number",
  telephone: "Telephone Number",
  contact_address: "Contact Person Address",
  business_nature: "Nature of Business",
  brand_name: "Brand Name",
  ingredient_name: "Ingredient Name",
}

// A supplier's document, stored privately. `key` is where the file is in the
// documents bucket; there's no public link, so it is opened through
// `documentHref`, which checks the customer is signed in. A document saved
// before storage moved to S3 had a public `url` instead: it's listed without
// a `key`, and can't be opened, until the backend's move script has secured it.
export type StoredDocument = {
  label: string
  filename: string
  key?: string
  uploaded_at?: string
}

type SavedDocument = Partial<StoredDocument> & { url?: string }

export const documentsOf = (metadata: unknown): StoredDocument[] => {
  const docs = (metadata as Record<string, unknown> | null)?.documents
  return (Array.isArray(docs) ? (docs as (SavedDocument | null)[]) : []).flatMap(
    (d) =>
      d?.label && (d.key || d.url)
        ? [
            {
              label: d.label,
              filename: d.filename || d.label,
              key: d.key,
              uploaded_at: d.uploaded_at,
            },
          ]
        : []
  )
}

// "ISO 22000/HACCP Form" -> "iso-22000-haccp-form". Must match `documentType`
// in the backend's src/api/utils/document-files.ts.
const documentType = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

/** Where the signed-in customer opens one of their documents. */
export const documentHref = (label: string) => `/api/documents/${documentType(label)}`
