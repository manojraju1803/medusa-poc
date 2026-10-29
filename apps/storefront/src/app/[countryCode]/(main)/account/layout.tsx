import { retrieveCustomer } from "@lib/data/customer"
import { NOINDEX } from "@lib/util/seo"
import { Metadata } from "next"
// TODO: Re-add Toaster component when needed
import AccountLayout from "@modules/account/templates/account-layout"

// Sign-in and every account page under it.
export const metadata: Metadata = {
  robots: NOINDEX,
}

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  return (
    <AccountLayout customer={customer}>
      {customer ? dashboard : login}
      {/* TODO: Re-add Toaster component when needed */}
    </AccountLayout>
  )
}
