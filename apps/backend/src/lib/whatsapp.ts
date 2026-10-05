interface SendCtaMessageParams {
  to: string
  headerText?: string
  bodyText: string
  footerText?: string
  buttonText: string
  buttonUrl: string
}

let activeToken = process.env.WHATSAPP_ACCESS_TOKEN || ""

export function normalizePhoneNumber(rawPhone: string, defaultCountryCode = "91"): string {
  if (!rawPhone) return ""
  let cleaned = rawPhone.replace(/[^\d+]/g, "")
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1)
  }
  // Strip leading zero common in Indian local format (e.g., 07619114115 -> 7619114115)
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.substring(1)
  }
  if (cleaned.length === 10) {
    cleaned = `${defaultCountryCode}${cleaned}`
  }
  return cleaned
}

/**
 * Attempts to automatically exchange/refresh an expired or short-lived token
 * if META_APP_ID and META_APP_SECRET are present in the environment.
 */
async function refreshAccessToken(): Promise<string | null> {
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  const currentToken = activeToken || process.env.WHATSAPP_ACCESS_TOKEN

  if (!appId || !appSecret || !currentToken) {
    return null
  }

  try {
    const exchangeUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${currentToken}`
    const res = await fetch(exchangeUrl, { method: "GET" })
    const data = await res.json()

    if (res.ok && data.access_token) {
      activeToken = data.access_token
      console.info("[WhatsApp] Access token successfully refreshed/extended into long-lived token.")
      return activeToken
    } else {
      console.error("[WhatsApp] Failed to refresh access token automatically:", JSON.stringify(data))
      return null
    }
  } catch (err: any) {
    console.error("[WhatsApp] Error refreshing token:", err?.message || err)
    return null
  }
}

import fs from "fs"
import path from "path"

function getCredentials(): { token: string; phoneId: string } {
  let token = ""
  let phoneId = ""

  try {
    const candidates = [
      path.resolve(process.cwd(), "apps/backend/.env"),
      path.resolve(process.cwd(), ".env"),
      path.resolve(__dirname, "../../.env"),
      path.resolve(__dirname, "../../../.env"),
      path.resolve(__dirname, "../../../../apps/backend/.env"),
    ]
    for (const envPath of candidates) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf8")
        const tokenMatch = content.match(/^WHATSAPP_ACCESS_TOKEN=(.*)$/m)
        if (tokenMatch && tokenMatch[1]) {
          token = tokenMatch[1].trim().replace(/^["']|["']$/g, "")
        }
        const phoneMatch = content.match(/^WHATSAPP_PHONE_NUMBER_ID=(.*)$/m)
        if (phoneMatch && phoneMatch[1]) {
          phoneId = phoneMatch[1].trim().replace(/^["']|["']$/g, "")
        }
        if (token) break
      }
    }
  } catch {}

  if (!token) {
    token = activeToken || process.env.WHATSAPP_ACCESS_TOKEN || ""
  }
  if (!phoneId) {
    phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || "616368184901733"
  }

  activeToken = token
  return { token, phoneId }
}

/**
 * Sends an Interactive CTA URL Button message to the recipient phone number.
 */
export async function sendWhatsAppCtaMessage({
  to,
  headerText,
  bodyText,
  footerText,
  buttonText,
  buttonUrl,
}: SendCtaMessageParams): Promise<{ success: boolean; data?: any; error?: string }> {
  const { token, phoneId } = getCredentials()
  console.log(`[WhatsApp] Using Token prefix: "${token.substring(0, 15)}..." length: ${token.length} with Phone ID: "${phoneId}"`)

  if (!token || !phoneId) {
    console.warn("[WhatsApp] Credentials missing: WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set in env.")
    return { success: false, error: "Credentials missing in environment" }
  }

  const recipientPhone = normalizePhoneNumber(to)
  if (!recipientPhone) {
    console.warn(`[WhatsApp] Invalid recipient phone number provided: "${to}"`)
    return { success: false, error: "Invalid recipient phone number" }
  }

  const payload: Record<string, any> = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
    type: "interactive",
    interactive: {
      type: "cta_url",
      header: headerText ? { type: "text", text: headerText } : undefined,
      body: {
        text: bodyText,
      },
      footer: footerText ? { text: footerText } : undefined,
      action: {
        name: "cta_url",
        parameters: {
          display_text: buttonText,
          url: buttonUrl,
        },
      },
    },
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`
    let response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    let data = await response.json()

    // Error code 190 indicates expired/invalid token -> attempt auto-refresh
    if (!response.ok && data?.error?.code === 190) {
      console.warn("[WhatsApp] Access token expired (Code 190). Attempting automatic refresh...")
      const newToken = await refreshAccessToken()
      if (newToken) {
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${newToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
        data = await response.json()
      }
    }

    if (!response.ok) {
      console.error("[WhatsApp] Meta API Error Response:", JSON.stringify(data))
      return { success: false, error: data?.error?.message || "WhatsApp API request failed", data }
    }

    console.info(`[WhatsApp] Interactive CTA message sent successfully to ${recipientPhone}:`, data?.messages?.[0]?.id)
    return { success: true, data }
  } catch (error: any) {
    console.error("[WhatsApp] Exception occurred while sending WhatsApp message:", error?.message || error)
    return { success: false, error: error?.message || "Unknown network error" }
  }
}
