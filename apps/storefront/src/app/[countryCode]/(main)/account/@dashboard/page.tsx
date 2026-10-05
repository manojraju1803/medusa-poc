import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"

export const metadata: Metadata = {
  title: "B2B Account Dashboard | IngredientsBazar",
  description: "Overview of your account activity, wholesale orders, and delivery addresses.",
}

export default async function OverviewTemplate() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    notFound()
  }

  const orders = (await listOrders().catch(() => [])) || []

  return <Overview customer={customer} orders={orders} />
}
