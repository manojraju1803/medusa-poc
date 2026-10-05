import { Metadata } from "next"

import ProfilePhone from "@modules/account//components/profile-phone"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"
import { notFound } from "next/navigation"
import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Profile & Business Details | IngredientsBazar",
  description: "View and edit your IngredientsBazar B2B profile and GST billing info.",
}

export default async function Profile() {
  const customer = await retrieveCustomer()
  const regions = await listRegions()

  if (!customer || !regions) {
    notFound()
  }

  return (
    <div className="w-full flex flex-col gap-6" data-testid="profile-page-wrapper">
      <div className="flex flex-col gap-1 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-[#0f172a]">
          Company & Contact Profile
        </h1>
        <p className="text-xs text-[#64748b]">
          Manage your organization name, procurement officer details, contact numbers, and GST registered billing address.
        </p>
      </div>
      <div className="flex flex-col gap-y-4 w-full">
        <ProfileName customer={customer} />
        <ProfileEmail customer={customer} />
        <ProfilePhone customer={customer} />
        <ProfileBillingAddress customer={customer} regions={regions} />
      </div>
    </div>
  )
}
