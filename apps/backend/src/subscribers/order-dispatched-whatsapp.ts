import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendWhatsAppCtaMessage } from "../lib/whatsapp"

export default async function orderDispatchedWhatsAppSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; order_id?: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  try {
    const orderId = data.order_id || data.id

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "shipping_address.*",
        "customer.*",
        "fulfillments.*",
      ],
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order) {
      logger.warn(`[WhatsApp Subscriber] Order ${orderId} not found for dispatch event.`)
      return
    }

    const phone = order.shipping_address?.phone || order.customer?.phone
    if (!phone) {
      logger.info(`[WhatsApp Subscriber] No phone number associated with Order #${order.display_id || order.id}. Skipping WhatsApp message.`)
      return
    }

    const customerName = [order.shipping_address?.first_name, order.shipping_address?.last_name]
      .filter(Boolean)
      .join(" ") || "Customer"

    const orderNumber = order.display_id ? `#${order.display_id}` : order.id
    const storefrontUrl = process.env.STOREFRONT_URL || "http://localhost:8000"
    const trackingUrl = `${storefrontUrl}/order/confirmed/${order.id}`

    const header = "🚚 Order Dispatched"
    const body = `Hi ${customerName},\n\nGreat news! Your IngredientsBazar order ${orderNumber} has been dispatched and is on its way to you.\n\nClick the button below to track your live shipment.`
    const footer = "IngredientsBazar Logistics"
    const buttonText = "Track Order"

    logger.info(`[WhatsApp Subscriber] Dispatching interactive CTA WhatsApp message for dispatch event on order ${orderNumber} to ${phone}...`)

    await sendWhatsAppCtaMessage({
      to: phone,
      headerText: header,
      bodyText: body,
      footerText: footer,
      buttonText,
      buttonUrl: trackingUrl,
    })
  } catch (err: any) {
    logger.error(`[WhatsApp Subscriber] Unexpected error sending Order Dispatched notification: ${err?.message || err}`)
  }
}

export const config: SubscriberConfig = {
  event: ["order.fulfillment_created", "fulfillment.created"],
}
