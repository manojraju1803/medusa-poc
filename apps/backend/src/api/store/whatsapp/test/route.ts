import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { sendWhatsAppCtaMessage, normalizePhoneNumber } from "../../../../lib/whatsapp"

interface TestWhatsAppBody {
  to?: string
  headerText?: string
  bodyText?: string
  footerText?: string
  buttonText?: string
  buttonUrl?: string
}

/**
 * POST /store/whatsapp/test
 * Send a test WhatsApp Interactive CTA message
 */
export async function POST(
  req: MedusaRequest<TestWhatsAppBody>,
  res: MedusaResponse
) {
  const {
    to,
    headerText = "IngredientsBazar Notification",
    bodyText = "This is a test notification from IngredientsBazar. Your WhatsApp integration is working properly!",
    footerText = "IngredientsBazar Automated Support",
    buttonText = "Visit Store",
    buttonUrl = "https://storefront-snowy-iota.vercel.app",
  } = (req.body || {}) as TestWhatsAppBody

  if (!to) {
    return res.status(400).json({
      success: false,
      error: "Missing required 'to' phone number in request body. Example: { \"to\": \"+919876543210\" }",
    })
  }

  const result = await sendWhatsAppCtaMessage({
    to,
    headerText,
    bodyText,
    footerText,
    buttonText,
    buttonUrl,
  })

  if (!result.success) {
    return res.status(500).json({
      success: false,
      error: result.error,
      details: result.data,
      recipient: normalizePhoneNumber(to),
    })
  }

  return res.status(200).json({
    success: true,
    message: "WhatsApp test message dispatched successfully",
    recipient: normalizePhoneNumber(to),
    details: result.data,
  })
}

/**
 * GET /store/whatsapp/test?to=919876543210
 * Quick GET endpoint for testing from browser or curl
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const to = req.query.to as string

  if (!to) {
    return res.status(400).json({
      success: false,
      message: "Please provide a 'to' query parameter with recipient phone number.",
      example: "/store/whatsapp/test?to=919876543210",
      configuredPhoneId: process.env.WHATSAPP_PHONE_NUMBER_ID ? "Configured" : "Missing",
      hasAccessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
    })
  }

  const result = await sendWhatsAppCtaMessage({
    to,
    headerText: "IngredientsBazar Test",
    bodyText: "Hello! This is a test message from IngredientsBazar Medusa backend.",
    footerText: "IngredientsBazar Support",
    buttonText: "Open Storefront",
    buttonUrl: "https://storefront-snowy-iota.vercel.app",
  })

  if (!result.success) {
    return res.status(500).json({
      success: false,
      error: result.error,
      details: result.data,
      recipient: normalizePhoneNumber(to),
    })
  }

  return res.status(200).json({
    success: true,
    message: "WhatsApp test message sent successfully",
    recipient: normalizePhoneNumber(to),
    details: result.data,
  })
}
