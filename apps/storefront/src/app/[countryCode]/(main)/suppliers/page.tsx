import { staticPageMetadata } from "@lib/util/seo"

import PageBanner from "@modules/suppliers/components/page-banner"
import SupplierDirectory from "@modules/suppliers/components/supplier-directory"
import { listSuppliers } from "@modules/suppliers/data"

export const generateMetadata = staticPageMetadata({
  path: "/suppliers",
  title: "Suppliers",
  description: "Browse the brands and suppliers on Ingredients Bazar.",
})

export default async function SuppliersPage() {
  const suppliers = await listSuppliers()
  const productCount = suppliers.reduce((sum, s) => sum + s.productCount, 0)
  const countries = new Set(suppliers.map((s) => s.country).filter(Boolean))

  const stats = [
    { v: suppliers.length, l: "Suppliers" },
    { v: productCount, l: "Products" },
    ...(countries.size ? [{ v: countries.size, l: "Countries" }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#fafdf5]" data-testid="suppliers-page">
      <PageBanner
        title="Find Trusted Suppliers"
        subtitle="Every brand on Ingredients Bazar, with its full product range"
      />
      {suppliers.length > 0 && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-wrap justify-around gap-4">
            {stats.map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-xl font-extrabold text-[#4d7c0f]">
                  {s.v}
                </div>
                <div className="text-xs text-[#64748b]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <SupplierDirectory suppliers={suppliers} />
      </div>
    </div>
  )
}
