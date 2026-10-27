"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { FetchError } from "@medusajs/js-sdk"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { cache } from "react"
import {
  documentField,
  DOCUMENT_MIME_TYPES,
  FieldErrors,
  fieldsForRole,
  FormValues,
  normalizeValues,
  parseRole,
  QUALITY_DOCUMENTS,
  validateDocument,
  validateRegistration,
} from "@lib/util/registration"
import { submitInquiry } from "./inquiries"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  getPendingCustomer,
  PendingCustomer,
  removeAuthToken,
  removeCartId,
  removePendingCustomer,
  setAuthToken,
  setPendingCustomer,
} from "./cookies"

export type CustomerAuthState =
  | { state: "error"; error: string }
  | { state: "verification_required"; email: string }
  | { state: "success" }
  | null

// Requests a verification email for the given customer. The request must be
// authenticated with a token tied to the auth identity (the token returned by
// register or by a login that requires verification).
async function requestVerificationEmail(email: string, token: string) {
  await sdk.auth.verification.request(
    {
      entity_id: email,
      entity_type: "email",
    },
    {
      authorization: `Bearer ${token}`,
    },
  )
}

// The layout, nav and page all ask for the customer while rendering one
// request; React's cache() shares a single lookup between them. Keyed by the
// token, so buyers never share an entry.
const fetchCustomer = cache(
  async (authorization: string): Promise<HttpTypes.StoreCustomer | null> =>
    sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        headers: { authorization },
        next: { ...(await getCacheOptions("customers")) },
        cache: "force-cache",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
)

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    // Signed-out visitors have no token; asking the backend only earns a 401,
    // which is never cached, so it used to cost a round trip on every page.
    if (!("authorization" in authHeaders)) return null

    return fetchCustomer(authHeaders.authorization)
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

// Extra signup fields kept with the pending customer until the record exists.
type PendingSignup = PendingCustomer & {
  company_name?: string
  metadata?: Record<string, unknown>
}

export type RegisterState =
  | { state: "error"; error: string; fieldErrors?: FieldErrors }
  | { state: "verification_required"; email: string }
  | { state: "success" }
  | null

type UploadedDocument = { label: string; filename: string; url: string }

// Fields copied verbatim into `customer.metadata`, per role.
const METADATA_FIELDS: Record<"buyer" | "supplier", string[]> = {
  buyer: [
    "company_nature",
    "registered_address",
    "city",
    "state",
    "postcode",
    "gst_number",
    "fssai_number",
    "contact_address",
    "designation",
    "telephone",
  ],
  supplier: [
    "company_nature",
    "registered_address",
    "warehouse_address",
    "gst_number",
    "fssai_number",
    "telephone",
    "business_nature",
    "brand_name",
    "ingredient_name",
  ],
}

const readDocuments = (formData: FormData) =>
  QUALITY_DOCUMENTS.map((label, index) => {
    const file = formData.get(documentField(index))
    return { label, index, file: file instanceof File && file.size ? file : null }
  }).filter((d): d is { label: string; index: number; file: File } => !!d.file)

async function uploadDocuments(
  docs: { label: string; file: File }[],
  token: string,
): Promise<UploadedDocument[]> {
  const files = await Promise.all(
    docs.map(async ({ label, file }) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
      return {
        label,
        filename: file.name,
        mimeType: DOCUMENT_MIME_TYPES[ext],
        content: Buffer.from(await file.arrayBuffer()).toString("base64"),
      }
    }),
  )
  const res = await sdk.client.fetch<{ files: UploadedDocument[] }>(
    "/store/registration-documents",
    {
      method: "POST",
      body: { files },
      headers: { authorization: `Bearer ${token}` },
    },
  )
  return res.files.map(({ label, filename, url }) => ({ label, filename, url }))
}

const errorText = (error: unknown) => String(error).replace(/^Error:\s*/, "")

const EXISTING_ACCOUNT =
  "An account with this e-mail already exists. Please sign in instead."

export async function registerAccount(
  _currentState: unknown,
  formData: FormData,
): Promise<RegisterState> {
  const role = parseRole(formData.get("account_type"))
  const kind = role === "supplier" ? "supplier" : "buyer"

  const raw: FormValues = {}
  for (const field of fieldsForRole(role)) {
    raw[field] = String(formData.get(field) ?? "")
  }
  const values = normalizeValues(raw)
  const fieldErrors = validateRegistration(role, values)

  const documents = role === "supplier" ? readDocuments(formData) : []
  for (const doc of documents) {
    const error = validateDocument(doc.file)
    if (error) fieldErrors[documentField(doc.index)] = error
  }

  if (Object.keys(fieldErrors).length) {
    return {
      state: "error",
      error: "Please review the highlighted fields.",
      fieldErrors,
    }
  }

  const metadata: Record<string, unknown> = {
    account_type: role,
    terms_accepted_at: new Date().toISOString(),
  }
  for (const field of METADATA_FIELDS[kind]) {
    if (values[field]) metadata[field] = values[field]
  }

  const [firstName, ...rest] =
    kind === "buyer" ? values.contact_person.split(/\s+/) : [""]
  const customerForm: PendingSignup = {
    email: values.email,
    first_name: firstName || undefined,
    last_name: rest.join(" ") || undefined,
    phone: values.mobile || undefined,
    company_name: values.company_name || undefined,
    metadata,
  }

  let token: string | null = null
  let identityExisted = false
  try {
    token = await sdk.auth.register("customer", "emailpass", {
      email: values.email,
      password: values.password,
    })
  } catch (error) {
    const fetchError = error as FetchError
    // An existing identity (for example, an admin user with the same email) is
    // expected and handled: the customer can still log in to link a customer
    // record. Any other error is surfaced.
    if (
      fetchError.statusText !== "Unauthorized" ||
      fetchError.message !== "Identity with email already exists"
    ) {
      return { state: "error", error: errorText(error) }
    }
    identityExisted = true
  }

  // Supplier documents are uploaded with the new identity's token; the upload
  // route accepts tokens that have no customer record yet.
  let uploaded: UploadedDocument[] = []
  if (documents.length) {
    if (!token) {
      const result = await sdk.auth
        .login("customer", "emailpass", {
          email: values.email,
          password: values.password,
        })
        .catch(() => null)
      token =
        typeof result === "string"
          ? result
          : result && "token" in result
          ? result.token
          : null
    }
    if (!token) {
      return { state: "error", error: EXISTING_ACCOUNT }
    }
    try {
      uploaded = await uploadDocuments(documents, token)
    } catch (error) {
      return {
        state: "error",
        error: `Your documents could not be uploaded: ${errorText(error)}`,
      }
    }
  }

  // Kept on the customer too, so the supplier's profile can show them.
  if (uploaded.length) {
    const uploadedAt = new Date().toISOString()
    metadata.documents = uploaded.map((d) => ({ ...d, uploaded_at: uploadedAt }))
  }

  // Persist the extra signup fields. The customer record is created during
  // login, which is deferred until after email verification when the backend
  // requires it.
  await setPendingCustomer(customerForm)

  // Suppliers are onboarded by the team, so they also leave an inquiry. A
  // failed inquiry must not block the account itself.
  if (role === "supplier") {
    await submitInquiry({
      type: "supplier_registration",
      name: values.company_name,
      email: values.email,
      phone: values.mobile || undefined,
      company: values.company_name,
      metadata: { ...metadata, documents: uploaded },
    }).catch(() => null)
  }

  // Continue by logging in. The login response tells us whether the backend
  // requires email verification — we don't need a storefront-side flag.
  const result = await completeLogin(values.email, values.password)
  if (result?.state === "error" && identityExisted) {
    return { state: "error", error: EXISTING_ACCOUNT }
  }
  return result
}

export async function login(
  _currentState: unknown,
  formData: FormData,
): Promise<CustomerAuthState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return {
      state: "error",
      error: "Enter your e-mail and password to continue.",
    }
  }

  return completeLogin(email, password)
}

export type PasswordResetState =
  | { state: "error"; error: string }
  | { state: "sent"; email: string }
  | { state: "done" }
  | null

// Asks the backend to e-mail a reset link. The backend answers the same way
// whether or not the account exists, so this never reveals who is registered.
export async function requestPasswordReset(
  _currentState: unknown,
  formData: FormData,
): Promise<PasswordResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { state: "error", error: "Enter a valid e-mail address." }
  }

  try {
    await sdk.auth.resetPassword("customer", "emailpass", { identifier: email })
  } catch {
    return {
      state: "error",
      error: "We couldn't send the reset link. Please try again.",
    }
  }
  return { state: "sent", email }
}

// Sets a new password with the token from the reset e-mail.
export async function resetPassword(
  _currentState: unknown,
  formData: FormData,
): Promise<PasswordResetState> {
  const token = String(formData.get("token") ?? "")
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!token || !email) {
    return {
      state: "error",
      error: "This reset link is incomplete. Request a new one.",
    }
  }
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return {
      state: "error",
      error: "Use at least 8 characters with a mix of letters and numbers.",
    }
  }
  if (password !== formData.get("confirm_password")) {
    return { state: "error", error: "Passwords do not match." }
  }

  try {
    await sdk.auth.updateProvider(
      "customer",
      "emailpass",
      { email, password },
      token,
    )
  } catch {
    return {
      state: "error",
      error:
        "This reset link has expired or was already used. Request a new one.",
    }
  }
  return { state: "done" }
}

// Logs the customer in and reconciles the customer record. The behavior is
// driven entirely by the backend's login response, so it works whether or not
// email verification is enabled.
async function completeLogin(
  email: string,
  password: string,
): Promise<CustomerAuthState> {
  let result: Awaited<ReturnType<typeof sdk.auth.login>>

  try {
    result = await sdk.auth.login("customer", "emailpass", { email, password })
  } catch (error) {
    return { state: "error", error: String(error) }
  }

  // A `location` is returned by third-party auth providers, which this flow
  // doesn't support.
  if (typeof result === "object" && "location" in result) {
    return {
      state: "error",
      error: "This login method isn't supported by the storefront.",
    }
  }

  // The backend requires email verification and the customer hasn't verified
  // yet. Send the verification email and ask them to check their inbox.
  if (
    typeof result === "object" &&
    "verification_required" in result &&
    result.verification_required
  ) {
    try {
      await requestVerificationEmail(email, result.token)
    } catch {
      // Ignore: the customer can resend from the verification page.
    }
    return { state: "verification_required", email }
  }

  if (typeof result !== "string") {
    return {
      state: "error",
      error: "Authentication requires additional steps that aren't supported.",
    }
  }

  let token = result

  // The token may not be tied to a customer record yet — right after
  // registration, or after verifying a brand-new account. Ask the backend:
  // `/store/customers/me` rejects tokens without a registered actor, so a
  // failed retrieve means we still need to create the customer, then log in
  // again to obtain a customer-bound token.
  const customerExists = await sdk.store.customer
    .retrieve({}, { authorization: `Bearer ${token}` })
    .then(() => true)
    .catch(() => false)

  if (!customerExists) {
    const pending = (await getPendingCustomer()) as PendingSignup | null

    try {
      await sdk.store.customer.create(
        {
          email,
          first_name: pending?.first_name,
          last_name: pending?.last_name,
          phone: pending?.phone || undefined,
          company_name: pending?.company_name || undefined,
          metadata: pending?.metadata,
        },
        {},
        { authorization: `Bearer ${token}` },
      )

      token = (await sdk.auth.login("customer", "emailpass", {
        email,
        password,
      })) as string
    } catch (error) {
      return { state: "error", error: String(error) }
    }

    await removePendingCustomer()
  }

  await setAuthToken(token)

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)
  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  try {
    await transferCart()
  } catch (error) {
    return { state: "error", error: String(error) }
  }

  return { state: "success" }
}

// Confirms a customer's email using the token from the verification link.
//
// The confirm route doesn't require authentication, so this works even when the
// customer opens the link on a different device than the one they signed up on.
export async function confirmEmailVerification(
  token: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await sdk.auth.verification.confirm({ code: token })
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/account`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData,
): Promise<{ success: boolean; error: string | null }> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string,
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData,
): Promise<{ success: boolean; error: string | null }> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}
