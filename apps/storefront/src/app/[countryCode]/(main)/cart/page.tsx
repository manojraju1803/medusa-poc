import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listPriceTiers } from "@lib/data/price-tiers"
import { isCustomerApproved } from "@modules/account/lib/approval"
import CartTemplate from "@modules/cart/templates"
import { CART_FIELDS } from "@modules/cart/fields"
import { staticPageMetadata } from "@lib/util/seo"
import { notFound } from "next/navigation"

export const generateMetadata = staticPageMetadata({
  path: "/cart",
  title: "Cart",
  description: "View your cart",
  noindex: true,
})

export default async function Cart() {
  const cart = await retrieveCart(undefined, CART_FIELDS).catch((error) => {
    console.error(error)
    return notFound()
  })

  const productIds =
    cart?.items?.flatMap((item) => (item.product_id ? [item.product_id] : [])) ??
    []

  const [customer, priceTiers, approved] = await Promise.all([
    retrieveCustomer(),
    cart?.region_id
      ? listPriceTiers({ productIds, regionId: cart.region_id })
      : [],
    isCustomerApproved(),
  ])

  return (
    <CartTemplate
      cart={cart}
      customer={customer}
      priceTiers={priceTiers}
      approved={approved}
    />
  )
}
