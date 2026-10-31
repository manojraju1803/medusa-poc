import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { formatAmount, orderPageUrl, sendWhatsAppCtaMessage } from "../lib/whatsapp"

export default async function orderPaymentWhatsAppSubscriber({
  event: { data, name: eventName },
  container,
}: SubscriberArgs<{ id: string; order_id?: string; amount?: number }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  try {
    let orderId = data.order_id
    // The captured payment's own amount, when the event is about one payment.
    let paid: { amount?: unknown; currency_code?: string } | undefined

    if (!orderId && data.id?.startsWith("pay_")) {
      const { data: payments } = await query.graph({
        entity: "payment",
        fields: ["id", "payment_collection.order.id", "payment_collection.orders.id", "amount", "currency_code"],
        filters: { id: data.id },
      })
      const pay = payments?.[0] as any
      orderId = pay?.payment_collection?.order?.id || pay?.payment_collection?.orders?.[0]?.id
      paid = pay
    }

    if (!orderId) {
      orderId = data.id
    }

    if (!orderId || !orderId.startsWith("order_")) {
      return
    }

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
      logger.warn(`[WhatsApp Subscriber] Order ${orderId} not found for payment event (${eventName}).`)
      return
    }

    const phone = order.shipping_address?.phone || order.customer?.phone
    if (!phone) {
      logger.info(`[WhatsApp Subscriber] No phone number for Order #${order.display_id || order.id}. Skipping payment confirmation message.`)
      return
    }

    const customerName = [order.shipping_address?.first_name, order.shipping_address?.last_name]
      .filter(Boolean)
      .join(" ") || "Customer"

    const orderNumber = order.display_id ? `#${order.display_id}` : order.id
    const receiptUrl = orderPageUrl(order.id, order.shipping_address?.country_code)

    const formattedAmount = paid?.amount != null
      ? formatAmount(paid.amount as Parameters<typeof formatAmount>[0], paid.currency_code)
      : formatAmount(order.total, order.currency_code)

    const header = "💳 Payment Confirmed"
    const body = `Hi ${customerName},\n\nWe have successfully received your payment of ${formattedAmount} for order ${orderNumber}.\n\nYour order is being prepared by our fulfillment team.`
    const footer = "IngredientsBazar Billing"
    const buttonText = "View Receipt"

    logger.info(`[WhatsApp Subscriber] Sending Payment Confirmed WhatsApp message for ${orderNumber} to ${phone}...`)

    await sendWhatsAppCtaMessage({
      to: phone,
      headerText: header,
      bodyText: body,
      footerText: footer,
      buttonText,
      buttonUrl: receiptUrl,
    })
  } catch (err: any) {
    logger.error(`[WhatsApp Subscriber] Error sending Payment Confirmed notification: ${err?.message || err}`)
  }
}

export const config: SubscriberConfig = {
  event: [
    "payment.captured",
    "payment_collection.payment_captured",
  ],
}
