import { retrieveCustomer } from "@lib/data/customer"
import { retrieveOrder } from "@lib/data/orders"
import { loginPath } from "@lib/util/login-return"
import InvoiceTemplate from "@modules/order/templates/invoice-template"
import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string; id: string }>
  // An invoice link opened from the admin carries a short-lived token
  searchParams: Promise<{ token?: string }>
}

// Only the buyer who placed the order, or an admin's invoice link, gets it.
const loadOrder = async (id: string, token?: string) => {
  if (token) {
    return retrieveOrder(id, token).catch(() => null)
  }
  const customer = await retrieveCustomer().catch(() => null)
  // Signed out: skip the order lookup, which would only fail with a 404.
  const order = customer ? await retrieveOrder(id).catch(() => null) : null
  return order && order.customer_id === customer?.id ? order : null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params
  const { token } = await props.searchParams
  const order = await loadOrder(id, token)
  return {
    title: order ? `Invoice ${order.display_id}` : "Invoice",
    robots: { index: false, follow: false },
  }
}

// Printable tax invoice, outside the site layout so it prints clean.
export default async function InvoicePage(props: Props) {
  const { countryCode, id } = await props.params
  const { token } = await props.searchParams

  // A signed-out buyer signs in and comes back here.
  if (!token && !(await retrieveCustomer().catch(() => null))) {
    redirect(loginPath(countryCode, `/${countryCode}/invoice/${id}`))
  }

  const order = await loadOrder(id, token)

  if (!order) {
    notFound()
  }

  return <InvoiceTemplate order={order} />
}
