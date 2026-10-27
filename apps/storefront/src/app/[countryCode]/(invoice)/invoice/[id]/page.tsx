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
  const customer = await retrieveCustomer().catch(() => null)
  const order = customer ? await retrieveOrder(id).catch(() => null) : null
  return {
    title: order ? `Invoice ${order.display_id}` : "Invoice",
    robots: { index: false, follow: false },
  }
}

// Printable tax invoice, outside the site layout so it prints clean.
export default async function InvoicePage(props: Props) {
  const { id } = await props.params
  const customer = await retrieveCustomer().catch(() => null)
  // Signed out: skip the order lookup, which would only fail with a 401.
  const order = customer ? await retrieveOrder(id).catch(() => null) : null

  // Only the buyer who placed the order gets its invoice
  if (!customer || !order || order.customer_id !== customer.id) {
    notFound()
  }

  return <InvoiceTemplate order={order} />
}
