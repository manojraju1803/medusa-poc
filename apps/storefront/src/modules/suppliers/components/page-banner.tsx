import React from "react"

const PageBanner = ({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: React.ReactNode
  children?: React.ReactNode
}) => (
  <div className="relative bg-gradient-to-r from-[#0d3320] via-[#0d3320] to-[#006B4F] overflow-hidden">
    <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-white mb-1">
        {title}
      </h1>
      {subtitle && <p className="text-sm text-[#86efac]/80">{subtitle}</p>}
      {children}
    </div>
  </div>
)

export default PageBanner
