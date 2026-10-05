"use client"

import { useState } from "react"
import Image from "next/image"
import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(LOGIN_VIEW.SIGN_IN)

  return (
    <div className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-200/80 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Branding & Trust Sidebar */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#071D33] via-[#0B294A] to-[#1C94D2] p-8 text-white flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
                <span className="text-xl">🏢</span>
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight block">
                  IngredientsBazar
                </span>
                <span className="text-[10px] text-[#97C93E] uppercase tracking-widest font-semibold block">
                  B2B Procurement Portal
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <h2 className="text-xl font-bold leading-snug">
                India&apos;s Next Gen Multi-Brand Ingredients Platform
              </h2>
              <p className="text-xs text-[#bae6fd]/90 leading-relaxed">
                Source directly from verified manufacturers with guaranteed quality specs, instant GST invoicing, and factory-direct batch pricing.
              </p>
            </div>

            {/* Wholesale highlights list */}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/15">
              <div className="flex items-center gap-2.5 text-xs text-[#e0f2fe]">
                <span className="w-5 h-5 rounded-full bg-[#97C93E]/20 border border-[#97C93E]/40 flex items-center justify-center text-[10px] text-[#97C93E] font-bold shrink-0">✓</span>
                <span>Direct Multi-Brand Verified Pricing</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#e0f2fe]">
                <span className="w-5 h-5 rounded-full bg-[#97C93E]/20 border border-[#97C93E]/40 flex items-center justify-center text-[10px] text-[#97C93E] font-bold shrink-0">✓</span>
                <span>FSSAI, ISO & CoA Certified Batches</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#e0f2fe]">
                <span className="w-5 h-5 rounded-full bg-[#97C93E]/20 border border-[#97C93E]/40 flex items-center justify-center text-[10px] text-[#97C93E] font-bold shrink-0">✓</span>
                <span>Automated Commercial GST Invoicing</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#e0f2fe]">
                <span className="w-5 h-5 rounded-full bg-[#97C93E]/20 border border-[#97C93E]/40 flex items-center justify-center text-[10px] text-[#97C93E] font-bold shrink-0">✓</span>
                <span>Live WhatsApp Dispatch Tracking</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-[11px] text-[#bae6fd]/70">
            <span>🔒 256-Bit Encrypted Portal</span>
            <span>Support: +91 99999 99999</span>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {currentView === LOGIN_VIEW.SIGN_IN ? (
            <Login setCurrentView={setCurrentView} />
          ) : (
            <Register setCurrentView={setCurrentView} />
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginTemplate
