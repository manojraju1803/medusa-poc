"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Technical Specifications & Identification",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Quality Certifications & CoA Compliance",
      component: <CertificationsTab />,
    },
    {
      label: "Packaging, Storage & Logistics",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const hsn =
    (product.metadata?.hsn_code as string) ||
    product.hs_code ||
    product.handle?.match(/\d{8}/)?.[0] ||
    "04041090"

  return (
    <div className="text-xs text-[#374151] py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-y-3">
          <div className="p-3 rounded-lg bg-[#f8fffe] border border-gray-100">
            <span className="font-bold text-[#0f172a] block mb-0.5">Physical Appearance & Form</span>
            <p className="text-[#6b7280]">{product.material || "Free-flowing spray-dried uniform powder"}</p>
          </div>
          <div className="p-3 rounded-lg bg-[#f8fffe] border border-gray-100">
            <span className="font-bold text-[#0f172a] block mb-0.5">HSN / Tariff Classification</span>
            <p className="text-[#6b7280]">{hsn}</p>
          </div>
          <div className="p-3 rounded-lg bg-[#f8fffe] border border-gray-100">
            <span className="font-bold text-[#0f172a] block mb-0.5">Country of Origin</span>
            <p className="text-[#6b7280]">{product.origin_country || "India / Turkey / Global Sourcing"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-3">
          <div className="p-3 rounded-lg bg-[#f8fffe] border border-gray-100">
            <span className="font-bold text-[#0f172a] block mb-0.5">Standard Packaging Unit</span>
            <p className="text-[#6b7280]">{product.weight ? `${product.weight / 1000} kg Net Bag` : "20kg / 25kg Industrial Multi-wall Bag"}</p>
          </div>
          <div className="p-3 rounded-lg bg-[#f8fffe] border border-gray-100">
            <span className="font-bold text-[#0f172a] block mb-0.5">Assay & Purity</span>
            <p className="text-[#6b7280]">≥ 99.0% (Meets FCC / FSSAI / Pharmacopoeia standards)</p>
          </div>
          <div className="p-3 rounded-lg bg-[#f8fffe] border border-gray-100">
            <span className="font-bold text-[#0f172a] block mb-0.5">Shelf Life & Stability</span>
            <p className="text-[#6b7280]">24 Months from manufacturing date in sealed packaging</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const CertificationsTab = () => {
  return (
    <div className="text-xs text-[#374151] py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0]">
          <span className="text-[#166534] font-bold">✓</span>
          <span><strong>FSSAI:</strong> Central Licensing Approved</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0]">
          <span className="text-[#166534] font-bold">✓</span>
          <span><strong>ISO 9001:2015:</strong> Quality Management Certified</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0]">
          <span className="text-[#166534] font-bold">✓</span>
          <span><strong>GMP & HACCP:</strong> Good Manufacturing Practice</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0]">
          <span className="text-[#166534] font-bold">✓</span>
          <span><strong>Halal & Kosher:</strong> Traceable Global Certification</span>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-xs text-[#374151] py-4 space-y-3">
      <div className="p-3 rounded-lg bg-white border border-gray-100">
        <span className="font-bold text-[#0f172a] block mb-1">Storage Conditions</span>
        <p className="text-[#6b7280]">
          Store in a cool, dry, well-ventilated area away from direct sunlight, moisture, and strong odors. Keep container tightly closed.
        </p>
      </div>
      <div className="p-3 rounded-lg bg-white border border-gray-100">
        <span className="font-bold text-[#0f172a] block mb-1">Freight & Dispatch</span>
        <p className="text-[#6b7280]">
          Pan-India freight dispatched from central warehouses in Bengaluru, Mumbai, and Delhi. Palletized and stretch-wrapped for safe transit. Real-time WhatsApp tracking included.
        </p>
      </div>
    </div>
  )
}

export default ProductTabs
