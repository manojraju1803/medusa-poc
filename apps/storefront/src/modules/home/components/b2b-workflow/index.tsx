import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function B2bWorkflow() {
  return (
    <section className="py-16 bg-white border-b border-gray-200">
      <div className="content-container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1C94D2] mb-1 block">
            Streamlined Procurement
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-[#0f172a] mb-2">
            How B2B Sourcing Works
          </h2>
          <p className="text-sm text-[#6b7280]">
            From technical spec verification to doorstep freight delivery in 4 clear steps
          </p>
        </div>

        {/* 4 Step Process */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-[#F0F9FF] border border-sky-100 relative">
            <div className="w-8 h-8 rounded-full bg-[#1C94D2] text-white flex items-center justify-center font-bold text-xs mb-4 shadow-sm">
              1
            </div>
            <h3 className="font-bold text-sm text-[#0f172a] mb-1.5">
              Search & Technical Specs
            </h3>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Find raw ingredients by CAS number, assay percentage, grade, or brand with instant access to Certificate of Analysis (CoA).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F0F9FF] border border-sky-100 relative">
            <div className="w-8 h-8 rounded-full bg-[#1C94D2] text-white flex items-center justify-center font-bold text-xs mb-4 shadow-sm">
              2
            </div>
            <h3 className="font-bold text-sm text-[#0f172a] mb-1.5">
              MOQ & Tiered Pricing
            </h3>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Transparent wholesale tiered pricing according to required batch size — from pilot trials (25 kg) to container loads.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F0F9FF] border border-sky-100 relative">
            <div className="w-8 h-8 rounded-full bg-[#1C94D2] text-white flex items-center justify-center font-bold text-xs mb-4 shadow-sm">
              3
            </div>
            <h3 className="font-bold text-sm text-[#0f172a] mb-1.5">
              Instant Order or RFQ
            </h3>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Check out directly online with approved GST billing or request custom contracts and commercial trade credit terms.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F0F9FF] border border-sky-100 relative">
            <div className="w-8 h-8 rounded-full bg-[#1C94D2] text-white flex items-center justify-center font-bold text-xs mb-4 shadow-sm">
              4
            </div>
            <h3 className="font-bold text-sm text-[#0f172a] mb-1.5">
              WhatsApp & Live Tracking
            </h3>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Real-time WhatsApp notifications for Packing, Carrier Dispatch, In-Transit milestones, and Final Delivery with batch lab reports.
            </p>
          </div>
        </div>

        {/* Trust & Compliance Strip - Crisp Light Card */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#F0F9FF] via-white to-[#F4FBEA] text-[#0F172A] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border-2 border-[#BAE6FD]">
          <div className="flex flex-col gap-1 max-w-lg text-center md:text-left">
            <span className="text-xs font-bold text-[#15803D] uppercase tracking-wider">
              Quality Assurance & Compliance
            </span>
            <h3 className="text-xl font-extrabold text-[#0F172A]">
              Every batch verified for 100% industrial traceability
            </h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              All listed suppliers pass strict audits: FSSAI, ISO 9001:2015, GMP, Kosher, Halal, and Non-GMO certifications.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="px-3.5 py-2 rounded-xl bg-white border border-[#D4EDAB] text-xs font-bold text-[#15803D] shadow-xs hover:scale-105 transition-transform">
              ✓ FSSAI Registered
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-white border border-[#BAE6FD] text-xs font-bold text-[#0369A1] shadow-xs hover:scale-105 transition-transform">
              ✓ ISO 9001:2015
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-white border border-[#D4EDAB] text-xs font-bold text-[#15803D] shadow-xs hover:scale-105 transition-transform">
              ✓ GMP Certified
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-white border border-[#BAE6FD] text-xs font-bold text-[#0369A1] shadow-xs hover:scale-105 transition-transform">
              ✓ Halal & Kosher
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
