import { Metadata } from "next"
import { notFound } from "next/navigation"

import AddressBook from "@modules/account/components/address-book"

import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Delivery Locations & Warehouses | IngredientsBazar",
  description: "View and manage your factory, warehouse, and delivery hub addresses.",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full flex flex-col gap-6" data-testid="addresses-page-wrapper">
      <div className="flex flex-col gap-1 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-[#0f172a]">
          Delivery Locations & Warehouses
        </h1>
        <p className="text-xs text-[#64748b]">
          Save and manage delivery hubs, factory plants, and fulfillment warehouses for streamlined order checkout and freight dispatch.
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}
