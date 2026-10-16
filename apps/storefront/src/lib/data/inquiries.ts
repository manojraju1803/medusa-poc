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

export type Inquiry = { id: string; type: InquiryType; created_at: string }

export async function submitInquiry(body: InquiryInput): Promise<Inquiry> {
  const { inquiry } = await sdk.client.fetch<{ inquiry: Inquiry }>(
    "/store/inquiries",
    {
      method: "POST",
      body,
      headers: await getAuthHeaders(),
    }
  )
  return inquiry
}
