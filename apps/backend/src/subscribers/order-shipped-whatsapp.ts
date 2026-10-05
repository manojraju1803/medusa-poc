import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendWhatsAppCtaMessage } from "../lib/whatsapp"

export default async function orderShippedWhatsAppSubscriber({
  event: { data, name: eventName },
  container,
}: SubscriberArgs<{ id: string; order_id?: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  try {
    let orderId = data.order_id
    const targetId = (data as any).fulfillment_id || data.id

    if (!orderId && targetId) {
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
        "fulfillments.*",
        "fulfillments.labels.*",
      ],
      filters: { id: orderId },
    })

    if (!orders?.length && targetId) {
      const { data: fulfillments } = await query.graph({
        entity: "fulfillment",
        fields: [
          "id",
          "order_id",
          "labels.*",
          "orders.id",
          "orders.display_id",
          "orders.email",
          "orders.shipping_address.*",
          "orders.customer.*",
          "orders.fulfillments.*",
          "orders.fulfillments.labels.*",
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
      logger.warn(`[WhatsApp Subscriber] Order ${orderId || targetId} not found for shipment event (${eventName}).`)
      return
    }

    const phone = order.shipping_address?.phone || order.customer?.phone
    if (!phone) {
      logger.info(`[WhatsApp Subscriber] No phone number for Order #${order.display_id || order.id}. Skipping shipment message.`)
      return
    }

    const customerName = [order.shipping_address?.first_name, order.shipping_address?.last_name]
      .filter(Boolean)
      .join(" ") || "Customer"

    const orderNumber = order.display_id ? `#${order.display_id}` : order.id
    const storefrontUrl = process.env.STOREFRONT_URL || "https://storefront-snowy-iota.vercel.app"
    const trackingUrl = `${storefrontUrl}/in/order/${order.id}/confirmed`

    // Extract tracking numbers / carrier info
    let trackingInfo = ""
    const fulfillments = (order.fulfillments as any[]) || []
    const trackingNumbers: string[] = []
    fulfillments.forEach((f) => {
      if (Array.isArray(f.labels)) {
        f.labels.forEach((l: any) => {
          if (l.tracking_number) trackingNumbers.push(l.tracking_number)
        })
      }
      if (Array.isArray(f.tracking_numbers)) {
        trackingNumbers.push(...f.tracking_numbers)
      }
    })

    if (trackingNumbers.length > 0) {
      trackingInfo = `\n📦 *Tracking #:* ${trackingNumbers.join(", ")}`
    }

    const header = "🚚 Order In Transit"
    const body = `Hi ${customerName},\n\nGreat news! Your IngredientsBazar order ${orderNumber} has been shipped and is on its way to you.${trackingInfo}\n\nClick the button below to track your live delivery.`
    const footer = "IngredientsBazar Logistics"
    const buttonText = "Track Shipment"

    logger.info(`[WhatsApp Subscriber] Sending Order Shipped WhatsApp message for ${orderNumber} to ${phone}...`)

    await sendWhatsAppCtaMessage({
      to: phone,
      headerText: header,
      bodyText: body,
      footerText: footer,
      buttonText,
      buttonUrl: trackingUrl,
    })
  } catch (err: any) {
    logger.error(`[WhatsApp Subscriber] Error sending Order Shipped notification: ${err?.message || err}`)
  }
}

export const config: SubscriberConfig = {
  event: [
    "shipment.created",
    "order.shipment_created",
    "fulfillment.shipment_created",
    "order.shipped",
    "fulfillment.shipped",
  ],
}
