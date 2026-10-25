"use server"

import { revalidateTag } from "next/cache"

import { sdk } from "@lib/config"
import {
  documentField,
  DOCUMENT_MIME_TYPES,
  FieldErrors,
  FormValues,
  normalizeValues,
  profileSectionsFor,
  profileValues,
  QUALITY_DOCUMENTS,
  roleOfCustomer,
  StoredDocument,
  TOP_LEVEL_FIELDS,
  validateDocument,
  validateFields,
} from "@lib/util/registration"
import { getAuthHeaders, getCacheTag } from "./cookies"
import { retrieveCustomer } from "./customer"

export type ProfileSaveState =
  | { state: "error"; error: string; fieldErrors?: FieldErrors }
  | { state: "saved"; at: number }
  | null

const errorText = (error: unknown) => String(error).replace(/^Error:\s*/, "")

const refreshCustomer = async () => revalidateTag(await getCacheTag("customers"))

// Saves one profile section. The account type comes from the stored customer,
// never from the form, and only that section's fields are accepted.
export async function updateProfileSection(
  _prev: ProfileSaveState,
  formData: FormData
): Promise<ProfileSaveState> {
  const customer = await retrieveCustomer()
  if (!customer) return { state: "error", error: "Please sign in again." }

  const role = roleOfCustomer(customer.metadata)
  const section = profileSectionsFor(role).find(
    (s) => s.key === formData.get("section")
  )
  if (!section) return { state: "error", error: "Unknown section." }

  const current = profileValues(customer)
  const submitted: FormValues = {}
  for (const field of section.fields) {
    submitted[field] = String(formData.get(field) ?? "")
  }
  const values = normalizeValues(submitted)
  const fieldErrors = validateFields(role, { ...current, ...values }, section.fields)
  if (Object.keys(fieldErrors).length) {
    return {
      state: "error",
      error: "Please review the highlighted fields.",
      fieldErrors,
    }
  }

  const metadata: Record<string, unknown> = { ...(customer.metadata ?? {}) }
  const update: Record<string, unknown> = {}
  for (const field of section.fields) {
    const value = values[field]
    if (field === "company_name") update.company_name = value || null
    else if (field === "mobile") update.phone = value || null
    else if (field === "contact_person") {
      const [first, ...rest] = value.split(" ")
      update.first_name = first || null
      update.last_name = rest.join(" ") || null
    } else if (!TOP_LEVEL_FIELDS.includes(field)) {
      if (value) metadata[field] = value
      else delete metadata[field]
    }
  }
  update.metadata = metadata

  try {
    await sdk.store.customer.update(update, {}, await getAuthHeaders())
  } catch (error) {
    return { state: "error", error: errorText(error) }
  }
  await refreshCustomer()
  return { state: "saved", at: Date.now() }
}

export type DocumentsSaveState =
  | { state: "error"; error: string; fieldErrors?: FieldErrors }
  | { state: "saved"; documents: StoredDocument[]; at: number }
  | null

// Uploads, replaces (same label) or removes a supplier's quality documents.
export async function updateMyDocuments(
  _prev: DocumentsSaveState,
  formData: FormData
): Promise<DocumentsSaveState> {
  const fieldErrors: FieldErrors = {}
  const files: { label: string; filename: string; mimeType: string; content: string }[] = []

  for (let i = 0; i < QUALITY_DOCUMENTS.length; i++) {
    const label = QUALITY_DOCUMENTS[i]
    const file = formData.get(documentField(i))
    if (!(file instanceof File) || !file.size) continue
    const error = validateDocument(file)
    if (error) {
      fieldErrors[documentField(i)] = error
      continue
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    files.push({
      label,
      filename: file.name,
      mimeType: DOCUMENT_MIME_TYPES[ext],
      content: Buffer.from(await file.arrayBuffer()).toString("base64"),
    })
  }
  if (Object.keys(fieldErrors).length) {
    return { state: "error", error: "Please fix the highlighted files.", fieldErrors }
  }

  const remove = formData
    .getAll("remove")
    .map(String)
    .filter((label) => QUALITY_DOCUMENTS.includes(label))
  if (!files.length && !remove.length) {
    return { state: "error", error: "Choose a file to upload or a document to remove." }
  }

  try {
    const { documents } = await sdk.client.fetch<{ documents: StoredDocument[] }>(
      "/store/customers/me/documents",
      {
        method: "POST",
        body: { files, remove },
        headers: await getAuthHeaders(),
      }
    )
    await refreshCustomer()
    return { state: "saved", documents, at: Date.now() }
  } catch (error) {
    return { state: "error", error: errorText(error) }
  }
}

export type PasswordLinkState =
  | { state: "error"; error: string }
  | { state: "sent"; email: string }
  | null

// Sends the signed-in customer a password-reset link (same flow as "Forgot
// password?"), which is how a password is changed with e-mail sign-in.
export async function sendMyPasswordReset(
  _prev: PasswordLinkState,
  _formData: FormData
): Promise<PasswordLinkState> {
  const customer = await retrieveCustomer()
  if (!customer?.email) return { state: "error", error: "Please sign in again." }
  try {
    await sdk.auth.resetPassword("customer", "emailpass", {
      identifier: customer.email,
    })
  } catch {
    return { state: "error", error: "We couldn't send the link. Please try again." }
  }
  return { state: "sent", email: customer.email }
}
