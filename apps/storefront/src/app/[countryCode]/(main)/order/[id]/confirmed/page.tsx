import { retrieveCustomer } from "@lib/data/customer"
import { retrieveOrder } from "@lib/data/orders"
import { loginPath } from "@lib/util/login-return"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string; id: string }>
}
export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "You purchase was successful",
}

export default async function OrderConfirmedPage(props: Props) {
  const params = await props.params

  // Orders are shown to their buyer only. A signed-out buyer, e.g. from a
  // WhatsApp link, signs in and comes back here.
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) {
    redirect(
      loginPath(params.countryCode, `/${params.countryCode}/order/${params.id}/confirmed`)
    )
  }

  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    return notFound()
  }

  return <OrderCompletedTemplate order={order} metadata={order.metadata ?? null} />
}
