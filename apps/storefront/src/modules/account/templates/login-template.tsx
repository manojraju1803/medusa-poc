"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const WHY_JOIN = [
  {
    title: "Verified brands, one place",
    desc: "Source food & nutrition ingredients from trusted brands.",
  },
  {
    title: "Quantity slab pricing",
    desc: "Approved buyers see live prices and bulk discounts.",
  },
  {
    title: "GST invoices",
    desc: "Proper CGST / SGST / IGST billing on every order.",
  },
  {
    title: "Quotes & samples",
    desc: "Request a quote or a sample for any product.",
  },
]

type Props = {
  stats?: { value: string; label: string }[]
  categories?: { name: string; handle: string }[]
}

const LoginTemplate = ({ stats = [], categories = [] }: Props) => {
  const searchParams = useSearchParams()
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(
    searchParams.get("view") === LOGIN_VIEW.REGISTER
      ? LOGIN_VIEW.REGISTER
      : LOGIN_VIEW.SIGN_IN
  )

  return (
    <>
    <div className="flex min-h-[calc(100vh-64px)]">
      <div className="hidden lg:flex lg:w-[48%] xl:w-[45%] relative flex-col overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=900&h=1100&fit=crop&auto=format"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#052e16]/[0.88] via-[#0d3320]/80 to-[#006B4F]/70" />
        </div>
        <div className="relative flex flex-col h-full p-10 xl:p-12">
          <div className="inline-flex w-fit items-center gap-2 bg-white/10 border border-white/20 text-[#86efac] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-pulse" />
            B2B ingredient marketplace
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-[1.15] mb-4">
            {currentView === LOGIN_VIEW.REGISTER ? "Join" : "Welcome back to"}
            <br />
            Ingredients
            <span className="text-[#4ade80]"> Bazar</span>
          </h2>
          <p className="text-[#bbf7d0]/85 text-sm leading-relaxed max-w-sm mb-8">
            Premium food and nutrition ingredients for manufacturers and
            traders, delivered from our Bangalore warehouse.
          </p>
          {stats.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-8">
              {stats.map((st) => (
                <div
                  key={st.label}
                  className="bg-white/10 border border-white/15 rounded-xl p-3 text-center"
                >
                  <div className="text-xl font-extrabold text-white">{st.value}</div>
                  <div className="text-[10px] text-[#86efac]/80 mt-0.5">{st.label}</div>
                </div>
              ))}
            </div>
          )}
          <div className="text-xs font-bold text-[#4ade80] uppercase tracking-wider mb-4">
            Why Join Ingredients Bazar?
          </div>
          <ul className="space-y-4">
            {WHY_JOIN.map((item) => (
              <li key={item.title} className="flex gap-3">
                <div className="w-5 h-5 bg-[#4ade80]/20 border border-[#4ade80]/30 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-[#4ade80]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">
                    {item.title}
                  </div>
                  <div className="text-[#86efac]/75 text-xs leading-relaxed">
                    {item.desc}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex-1 bg-[#fafffe] flex items-start justify-center py-10 px-4 sm:px-8">
        <div className="w-full max-w-[520px]">
          {currentView === LOGIN_VIEW.SIGN_IN ? (
            <Login setCurrentView={setCurrentView} />
          ) : (
            <Register setCurrentView={setCurrentView} />
          )}
        </div>
      </div>
    </div>
    {categories.length > 0 && (
      <div className="bg-[#0d3320] border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2">
            <span className="text-[#4ade80] text-xs font-semibold mr-3 shrink-0">
              Browse Categories:
            </span>
            {categories.map((cat, i) => (
              <span key={cat.handle} className="flex items-center">
                <LocalizedClientLink
                  href={`/categories/${cat.handle}`}
                  className="text-xs text-[#86efac] hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5"
                >
                  {cat.name}
                </LocalizedClientLink>
                {i < categories.length - 1 && (
                  <span className="text-white/15 mx-1">|</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default LoginTemplate
