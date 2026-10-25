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
  <div className="relative bg-gradient-to-r from-[#00356e] via-[#00356e] to-[#4d7c0f] overflow-hidden">
    <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-white mb-1">
        {title}
      </h1>
      {subtitle && <p className="text-sm text-[#c5e39a]/80">{subtitle}</p>}
      {children}
    </div>
  </div>
)

export default PageBanner
