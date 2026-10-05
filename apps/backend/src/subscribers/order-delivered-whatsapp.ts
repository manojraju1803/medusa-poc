import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendWhatsAppCtaMessage } from "../lib/whatsapp"

export default async function orderDeliveredWhatsAppSubscriber({
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
        fields: ["id", "order_id", "delivered_at", "orders.id"],
        filters: { id: targetId },
      })
      const ful = fulfillments?.[0] as any
      if (ful) {
        // If event is fulfillment.updated, only fire if marked delivered
        if (eventName === "fulfillment.fulfillment.updated" && !ful.delivered_at) {
          return
        }
        orderId = ful.order_id || ful.orders?.[0]?.id
      }
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
      logger.warn(`[WhatsApp Subscriber] Order ${orderId || targetId} not found for delivery event (${eventName}).`)
      return
    }

    const phone = order.shipping_address?.phone || order.customer?.phone
    if (!phone) {
      logger.info(`[WhatsApp Subscriber] No phone number associated with Order #${order.display_id || order.id}. Skipping WhatsApp delivery message.`)
      return
    }

    const customerName = [order.shipping_address?.first_name, order.shipping_address?.last_name]
      .filter(Boolean)
      .join(" ") || "Customer"

    const orderNumber = order.display_id ? `#${order.display_id}` : order.id
    const storefrontUrl = process.env.STOREFRONT_URL || "https://storefront-snowy-iota.vercel.app"
    const orderUrl = `${storefrontUrl}/in/order/${order.id}/confirmed`

    const header = "✅ Order Delivered"
    const body = `Hi ${customerName},\n\nYour IngredientsBazar order ${orderNumber} has been successfully delivered!\n\nWe hope everything arrived in perfect condition. Thank you for choosing IngredientsBazar!`
    const footer = "IngredientsBazar Logistics"
    const buttonText = "View Order & Invoice"

    logger.info(`[WhatsApp Subscriber] Dispatching interactive CTA WhatsApp message for delivery event ${eventName} on order ${orderNumber} to ${phone}...`)

    await sendWhatsAppCtaMessage({
      to: phone,
      headerText: header,
      bodyText: body,
      footerText: footer,
      buttonText,
      buttonUrl: orderUrl,
    })
  } catch (err: any) {
    logger.error(`[WhatsApp Subscriber] Unexpected error sending Order Delivered notification: ${err?.message || err}`)
  }
}

export const config: SubscriberConfig = {
  event: [
    "delivery.created",
    "order.completed",
    "order.delivered",
    "fulfillment.delivered",
    "order.fulfillment_delivered",
    "fulfillment.fulfillment.updated",
  ],
}

