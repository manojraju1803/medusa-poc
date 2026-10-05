import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#F0FDF4] via-[#F8FAFC] to-white py-16 lg:py-24 border-b border-gray-200">
      {/* Background ambient lighting effects matching Natural Logo Palette (Lime Green & Cyan Blue) */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#97C93E]/20 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#1C94D2]/15 rounded-full blur-3xl pointer-events-none animate-float-reverse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#97C93E]/10 via-[#1C94D2]/10 to-[#97C93E]/10 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />

      <div className="content-container relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* Natural Ingredients Slogan Pill with Shimmer Animation */}
        <div className="relative overflow-hidden inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#97C93E]/60 text-xs font-bold text-[#15803D] mb-5 shadow-xs before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_3s_infinite] before:bg-gradient-to-r before:from-transparent before:via-lime-100/60 before:to-transparent">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#97C93E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#97C93E]"></span>
          </span>
          <span className="relative z-10">Next Generation Multi-Brand Natural Ingredients Platform</span>
        </div>

        {/* Hero Title with Prominent Natural & Multi-Brand Ingredients Typography */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0F172A] mb-5 leading-tight max-w-4xl">
          India's Next Gen <span className="text-[#84B82A] drop-shadow-xs">Natural & Multi-Brand</span> <span className="text-[#1C94D2] drop-shadow-xs">Ingredients</span> Platform
        </h1>

        {/* Evident Natural Ingredients Subtitle */}
        <p className="text-base sm:text-lg text-[#334155] max-w-3xl mb-8 leading-relaxed font-normal">
          Direct B2B procurement for <strong className="font-bold text-[#0F172A]">100% pure botanical extracts, plant proteins, natural sweeteners, clean-label dairy, and certified raw materials</strong>. Sourced directly from verified global & Indian manufacturers with batch lab CoAs and pan-India logistics.
        </p>

        {/* Natural Pillars Quick Badge Strip */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D4EDAB] text-[#15803D] shadow-2xs">
            <span>🌿</span>
            <span>100% Pure Botanical Extracts</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#BAE6FD] text-[#0369A1] shadow-2xs">
            <span>🌱</span>
            <span>Plant-Based & Clean Label</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D4EDAB] text-[#15803D] shadow-2xs">
            <span>🔬</span>
            <span>Heavy Metal & Assay Tested</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#BAE6FD] text-[#0369A1] shadow-2xs">
            <span>📦</span>
            <span>MOQ from 25 kg Batch</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <LocalizedClientLink
            href="/store"
            className="px-6 py-3.5 rounded-xl bg-[#97C93E] hover:bg-[#84B82A] text-[#071D33] font-bold text-sm transition-all duration-300 shadow-md shadow-[#97C93E]/30 hover:shadow-lg hover:shadow-[#97C93E]/50 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.98] border border-[#D4EDAB] flex items-center gap-2"
          >
            <span>Explore Natural & Multi-Brand Catalog</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/store"
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-[#F0F9FF] text-[#0369A1] font-bold text-sm transition-all duration-300 shadow-xs border-2 border-[#1C94D2] hover:border-[#0284C7] hover:-translate-y-0.5 hover:shadow-md"
          >
            Request Sourcing Quote (RFQ)
          </LocalizedClientLink>
        </div>

        {/* 4 Feature Highlights / Value Props matching Natural Logo Tones on Crisp White Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
          <div className="p-5 rounded-2xl bg-white/95 border border-slate-200/90 hover:border-[#97C93E] transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1.5 group">
            <div className="text-2xl mb-2.5 p-2 rounded-xl bg-[#F4FBEA] border border-[#D4EDAB] w-fit transition-transform duration-300 group-hover:scale-110">🌿</div>
            <h3 className="font-bold text-[#0F172A] text-sm mb-1 group-hover:text-[#15803D] transition-colors">Botanicals & Phytochemicals</h3>
            <p className="text-xs text-[#475569] leading-relaxed">Standardized Curcumin 95%, Ashwagandha, Stevia Reb-A, Green Tea & Herbal Actives</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/95 border border-slate-200/90 hover:border-[#1C94D2] transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1.5 group">
            <div className="text-2xl mb-2.5 p-2 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] w-fit transition-transform duration-300 group-hover:scale-110">🔬</div>
            <h3 className="font-bold text-[#0F172A] text-sm mb-1 group-hover:text-[#1C94D2] transition-colors">Batch-Tested Lab CoAs</h3>
            <p className="text-xs text-[#475569] leading-relaxed">100% industrial traceability, HPLC purity assay, micro & heavy-metal lab certificates</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/95 border border-slate-200/90 hover:border-[#97C93E] transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1.5 group">
            <div className="text-2xl mb-2.5 p-2 rounded-xl bg-[#F4FBEA] border border-[#D4EDAB] w-fit transition-transform duration-300 group-hover:scale-110">🏢</div>
            <h3 className="font-bold text-[#0F172A] text-sm mb-1 group-hover:text-[#15803D] transition-colors">Verified Manufacturer Brands</h3>
            <p className="text-xs text-[#475569] leading-relaxed">Akay, Synthite, Vidya, Arjuna, Meggle, Glanbia, Taiyo, Amul & 50+ audited producers</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/95 border border-slate-200/90 hover:border-[#1C94D2] transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1.5 group">
            <div className="text-2xl mb-2.5 p-2 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] w-fit transition-transform duration-300 group-hover:scale-110">📦</div>
            <h3 className="font-bold text-[#0F172A] text-sm mb-1 group-hover:text-[#1C94D2] transition-colors">Farm-to-Factory Freight</h3>
            <p className="text-xs text-[#475569] leading-relaxed">Flexible batch procurement from 25 kg pilot trial packs to multi-ton bulk container loads</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
