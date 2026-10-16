"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type InquiryType = "quote_sample" | "contact" | "supplier_registration"

export type InquiryInput = {
  type: InquiryType
  name: string
  email: string
  phone?: string
  company?: string
  message?: string
  product_id?: string
  variant_id?: string
  quantity?: number
  unit?: string
  wants_quote?: boolean
  wants_sample?: boolean
  metadata?: Record<string, unknown>
}

export type InquiryResult =
  | { ok: true; inquiry: { id: string; type: InquiryType; created_at: string } }
  | { ok: false; error: string }

// POST /store/inquiries. Guests allowed; a signed-in customer is attached by
// the backend from the auth header.
export async function submitInquiry(body: InquiryInput): Promise<InquiryResult> {
  try {
    const { inquiry } = await sdk.client.fetch<{
      inquiry: { id: string; type: InquiryType; created_at: string }
    }>("/store/inquiries", {
      method: "POST",
      body,
      headers: await getAuthHeaders(),
    })
    return { ok: true, inquiry }
  } catch (e) {
    return {
      ok: false,
      error: (e as Error)?.message || "Could not send your request",
    }
  }
}
