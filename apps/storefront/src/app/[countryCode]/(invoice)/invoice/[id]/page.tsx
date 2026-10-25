import { retrieveCustomer } from "@lib/data/customer"
import { retrieveOrder } from "@lib/data/orders"
import InvoiceTemplate from "@modules/order/templates/invoice-template"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params
  const order = await retrieveOrder(id).catch(() => null)
  return { title: order ? `Invoice ${order.display_id}` : "Invoice" }
}

// Printable tax invoice, outside the site layout so it prints clean.
export default async function InvoicePage(props: Props) {
  const { id } = await props.params
  const customer = await retrieveCustomer().catch(() => null)
  const order = customer ? await retrieveOrder(id).catch(() => null) : null

  // Only the buyer who placed the order gets its invoice
  if (!order || order.customer_id !== customer?.id) {
    notFound()
  }

  return <InvoiceTemplate order={order} />
}
