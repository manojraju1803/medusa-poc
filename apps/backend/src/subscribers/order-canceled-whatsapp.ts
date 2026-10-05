import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendWhatsAppCtaMessage } from "../lib/whatsapp"

export default async function orderCanceledWhatsAppSubscriber({
  event: { data, name: eventName },
  container,
}: SubscriberArgs<{ id: string; order_id?: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  try {
    let orderId = data.order_id || data.id

    if (orderId?.startsWith("ful_")) {
      const { data: fulfillments } = await query.graph({
        entity: "fulfillment",
        fields: ["id", "order_id", "orders.id"],
        filters: { id: orderId },
      })
      orderId =
        (fulfillments?.[0] as any)?.order_id ||
        (fulfillments?.[0] as any)?.orders?.[0]?.id
    }

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "shipping_address.*",
        "customer.*",
      ],
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order) {
      logger.warn(`[WhatsApp Subscriber] Order ${orderId} not found for cancel event (${eventName}).`)
      return
    }

    const phone = order.shipping_address?.phone || order.customer?.phone
    if (!phone) {
      logger.info(`[WhatsApp Subscriber] No phone number for Order #${order.display_id || order.id}. Skipping canceled message.`)
      return
    }

    const customerName = [order.shipping_address?.first_name, order.shipping_address?.last_name]
      .filter(Boolean)
      .join(" ") || "Customer"

    const orderNumber = order.display_id ? `#${order.display_id}` : order.id
    const storefrontUrl = process.env.STOREFRONT_URL || "https://storefront-snowy-iota.vercel.app"
    const supportUrl = `${storefrontUrl}/in/order/${order.id}/confirmed`

    const header = "❌ Order Canceled"
    const body = `Hi ${customerName},\n\nYour IngredientsBazar order ${orderNumber} has been canceled.\n\nIf you have already made a payment, your refund will be processed back to your original payment source within 3-5 business days.\n\nIf you have questions, please reach out to our team.`
    const footer = "IngredientsBazar Support"
    const buttonText = "View Order Details"

    logger.info(`[WhatsApp Subscriber] Sending Order Canceled WhatsApp message for ${orderNumber} to ${phone}...`)

    await sendWhatsAppCtaMessage({
      to: phone,
      headerText: header,
      bodyText: body,
      footerText: footer,
      buttonText,
      buttonUrl: supportUrl,
    })
  } catch (err: any) {
    logger.error(`[WhatsApp Subscriber] Error sending Order Canceled notification: ${err?.message || err}`)
  }
}

export const config: SubscriberConfig = {
  event: [
    "order.canceled",
    "order.fulfillment_canceled",
  ],
}
