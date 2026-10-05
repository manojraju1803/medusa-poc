import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendWhatsAppCtaMessage } from "../lib/whatsapp"

export default async function orderPackedWhatsAppSubscriber({
  event: { data, name: eventName },
  container,
}: SubscriberArgs<{ id: string; order_id?: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  try {
    let orderId = data.order_id
    const targetId = (data as any).fulfillment_id || data.id

    if (!orderId && targetId?.startsWith("ful_")) {
      const { data: fulfillments } = await query.graph({
        entity: "fulfillment",
        fields: ["id", "order_id", "orders.id"],
        filters: { id: targetId },
      })
      orderId =
        (fulfillments?.[0] as any)?.order_id ||
        (fulfillments?.[0] as any)?.orders?.[0]?.id
    }

    if (!orderId) {
      orderId = data.id
    }

    let { data: orders } = await query.graph({
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

    if (!orders?.length && targetId) {
      const { data: fulfillments } = await query.graph({
        entity: "fulfillment",
        fields: [
          "id",
          "order_id",
          "orders.id",
          "orders.display_id",
          "orders.email",
          "orders.shipping_address.*",
          "orders.customer.*",
        ],
        filters: { id: targetId },
      })
      const foundOrder = (fulfillments?.[0] as any)?.orders?.[0]
      if (foundOrder) {
        orders = [foundOrder]
      }
    }

    const order = orders?.[0]
    if (!order) {
      logger.warn(`[WhatsApp Subscriber] Order ${orderId || targetId} not found for packed event (${eventName}).`)
      return
    }

    const phone = order.shipping_address?.phone || order.customer?.phone
    if (!phone) {
      logger.info(`[WhatsApp Subscriber] No phone number for Order #${order.display_id || order.id}. Skipping packed message.`)
      return
    }

    const customerName = [order.shipping_address?.first_name, order.shipping_address?.last_name]
      .filter(Boolean)
      .join(" ") || "Customer"

    const orderNumber = order.display_id ? `#${order.display_id}` : order.id
    const storefrontUrl = process.env.STOREFRONT_URL || "https://storefront-snowy-iota.vercel.app"
    const trackingUrl = `${storefrontUrl}/in/order/${order.id}/confirmed`

    const header = "📦 Order Packed"
    const body = `Hi ${customerName},\n\nYour IngredientsBazar order ${orderNumber} has been packed at our fulfillment center and is ready for carrier dispatch.\n\nClick the button below to check your live order status.`
    const footer = "IngredientsBazar Logistics"
    const buttonText = "View Order Status"

    logger.info(`[WhatsApp Subscriber] Sending Order Packed WhatsApp message for ${orderNumber} to ${phone}...`)

    await sendWhatsAppCtaMessage({
      to: phone,
      headerText: header,
      bodyText: body,
      footerText: footer,
      buttonText,
      buttonUrl: trackingUrl,
    })
  } catch (err: any) {
    logger.error(`[WhatsApp Subscriber] Error sending Order Packed notification: ${err?.message || err}`)
  }
}

export const config: SubscriberConfig = {
  event: [
    "order.fulfillment_created",
    "fulfillment.created",
    "fulfillment.fulfillment.created",
  ],
}
