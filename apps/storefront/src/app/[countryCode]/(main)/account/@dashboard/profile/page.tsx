import { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { listRegions } from "@lib/data/regions"
import {
  documentsOf,
  profileSectionsFor,
  profileValues,
  ROLE_LABEL,
  roleOfCustomer,
} from "@lib/util/registration"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import DocumentsCard from "@modules/account/components/profile-details/documents-card"
import SectionCard, { ProfileCard } from "@modules/account/components/profile-details/section-card"
import SecurityCard from "@modules/account/components/profile-details/security-card"
import { isCustomerApproved } from "@modules/account/lib/approval"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your IngredientsBazar profile.",
}

export default async function Profile() {
  const [customer, regions, approved] = await Promise.all([
    retrieveCustomer(),
    listRegions(),
    isCustomerApproved(),
  ])

  if (!customer || !regions) {
    notFound()
  }

  const role = roleOfCustomer(customer.metadata)
  const values = profileValues(customer)
  const contactName = values.contact_person
  const memberSince = customer.created_at
    ? new Date(customer.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <div className="w-full space-y-6" data-testid="profile-page-wrapper">
      <div className="rounded-2xl overflow-hidden border border-[#dbe3ec] bg-gradient-to-br from-[#00356e] to-[#2f5d1a] text-white">
        <div className="px-5 sm:px-6 py-5 flex flex-wrap items-center gap-4 justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#c5e39a]">My profile</p>
            <h1 className="mt-1 text-xl sm:text-2xl font-extrabold break-words">
              {customer.company_name || contactName || customer.email}
            </h1>
            <p className="mt-1 text-sm text-white/75 break-words">
              {[contactName && customer.company_name ? contactName : null, customer.email]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 border border-white/25 px-3 py-1 text-xs font-bold">
              {ROLE_LABEL[role]} account
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                approved ? "bg-[#7aba0c] text-[#00254d]" : "bg-amber-300 text-amber-950"
              }`}
            >
              {approved ? "Approved" : "Awaiting approval"}
            </span>
          </div>
        </div>
        {(memberSince || !approved) && (
          <div className="px-5 sm:px-6 py-2.5 bg-black/15 text-xs text-white/75">
            {!approved
              ? "Our team reviews new accounts within 24–48 hours. Prices and ordering unlock once you're approved."
              : `Member since ${memberSince}`}
          </div>
        )}
      </div>

      {profileSectionsFor(role).map((section) => (
        <SectionCard key={section.key} role={role} section={section} initial={values} />
      ))}

      {role === "supplier" && <DocumentsCard documents={documentsOf(customer.metadata)} />}

      <SecurityCard email={customer.email} />

      <ProfileCard title="Billing Address">
        <ProfileBillingAddress customer={customer} regions={regions} />
      </ProfileCard>
    </div>
  )
}
