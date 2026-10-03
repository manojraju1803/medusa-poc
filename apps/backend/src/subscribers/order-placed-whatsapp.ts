import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendWhatsAppCtaMessage } from "../lib/whatsapp"

export default async function orderPlacedWhatsAppSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "currency_code",
        "total",
        "shipping_address.*",
        "customer.*",
      ],
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order) {
      logger.warn(`[WhatsApp Subscriber] Order ${orderId} not found in database.`)
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
    const orderUrl = `${storefrontUrl}/order/confirmed/${order.id}`

    const header = "🎉 Order Confirmation"
    const body = `Hi ${customerName},\n\nThank you for shopping with IngredientsBazar! Your order ${orderNumber} has been successfully placed and is being prepared.\n\nClick the button below to view your full order details.`
    const footer = "IngredientsBazar Support"
    const buttonText = "View Order Details"

    logger.info(`[WhatsApp Subscriber] Dispatching interactive CTA WhatsApp message for order ${orderNumber} to ${phone}...`)

    await sendWhatsAppCtaMessage({
      to: phone,
      headerText: header,
      bodyText: body,
      footerText: footer,
      buttonText,
      buttonUrl: orderUrl,
    })
  } catch (err: any) {
    logger.error(`[WhatsApp Subscriber] Unexpected error sending Order Placed notification for order ${orderId}: ${err?.message || err}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
