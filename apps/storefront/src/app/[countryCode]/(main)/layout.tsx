import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { StoreCartShippingOption } from "@medusajs/types"
import BackButton from "@modules/layout/components/back-button"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import SiteChrome from "@modules/layout/components/site-chrome"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

export default async function PageLayout(props: { children: React.ReactNode }) {
  // Independent lookups, so side by side rather than one after the other.
  const [customer, cart] = await Promise.all([
    retrieveCustomer(),
    retrieveCart(),
  ])
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()

    shippingOptions = shipping_options
  }

  return (
    <>
      <SiteChrome loggedIn={!!customer}>
        <Nav />
      </SiteChrome>
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}
      <SiteChrome loggedIn={!!customer}>
        <BackButton />
      </SiteChrome>
      {props.children}
      <SiteChrome loggedIn={!!customer}>
        <Footer />
      </SiteChrome>
    </>
  )
}
