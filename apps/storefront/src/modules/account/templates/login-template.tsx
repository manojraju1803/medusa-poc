"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { AccountRole, parseRole } from "@lib/util/registration"
import {
  FeatureCards,
  PLATFORM_INTRO,
  PLATFORM_TAGLINE,
  StatChips,
  VisionMission,
} from "@modules/account/components/brand-content"
import ForgotPassword from "@modules/account/components/forgot-password"
import Login from "@modules/account/components/login"
import Register from "@modules/account/components/register"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  FORGOT_PASSWORD = "forgot-password",
}

const VIEWS = Object.values(LOGIN_VIEW) as string[]

// Sign-in, forgot-password and registration. The Buyer / R&D / Supplier choice
// lives on the registration form; `?view=register&role=supplier` deep-links to it.
const LoginTemplate = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const initialView = searchParams.get("view") ?? ""
  const [view, setView] = useState<LOGIN_VIEW>(
    VIEWS.includes(initialView) ? (initialView as LOGIN_VIEW) : LOGIN_VIEW.SIGN_IN
  )
  const [role, setRole] = useState<AccountRole>(parseRole(searchParams.get("role")))

  const go = (nextView: LOGIN_VIEW, nextRole: AccountRole = role) => {
    setView(nextView)
    setRole(nextRole)
    const params = new URLSearchParams(searchParams.toString())
    params.delete("role")
    params.delete("view")
    if (nextView !== LOGIN_VIEW.SIGN_IN) params.set("view", nextView)
    if (nextView === LOGIN_VIEW.REGISTER) params.set("role", nextRole)
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    window.scrollTo({ top: 0 })
  }

  if (view === LOGIN_VIEW.REGISTER) {
    return (
      <Register
        role={role}
        onRoleChange={(r) => go(LOGIN_VIEW.REGISTER, r)}
        onSignIn={() => go(LOGIN_VIEW.SIGN_IN)}
      />
    )
  }


  return (
    // Sized to one screen: everything on the left is kept compact so the page
    // doesn't need to scroll on laptops.
    <section className="relative min-h-[100svh] overflow-hidden bg-[#052e16] text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/home-hero.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#052e16]/[.95] via-[#0d3320]/[.86] to-[#14532d]/[.78]" />
      <div
        className="absolute inset-0 opacity-[.10] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"
        aria-hidden="true"
      />
      <div className="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-[#4ade80]/20 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-16 pb-6 lg:py-8 min-h-[100svh] grid lg:grid-cols-[1fr_420px] gap-6 lg:gap-14 items-center">
        <div className="max-w-xl">
          <LocalizedClientLink
            href="/"
            className="inline-flex bg-white rounded-xl px-3 py-2 shadow-lg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-hd.png" alt="Ingredients Bazar" className="h-8 sm:h-9 w-auto" />
          </LocalizedClientLink>

          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[#bbf7d0]">
            {PLATFORM_TAGLINE}
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-[1.1]">
            Welcome back to
            <span className="block text-[#4ade80]">Ingredients Bazar</span>
          </h1>
          <p className="hidden sm:block mt-3 text-sm text-white/75 leading-relaxed max-w-lg">
            {PLATFORM_INTRO}
          </p>

          <div className="hidden sm:block mt-7 space-y-6">
            <StatChips />
            <div className="h-px bg-white/15" />
            <FeatureCards />
            <VisionMission />
          </div>
        </div>

        <div className="w-full max-w-[420px] mx-auto lg:mx-0 text-[#0f172a] [&>section]:shadow-[0_24px_60px_rgba(0,20,45,0.45)] [&>section]:border-white/20">
          {view === LOGIN_VIEW.FORGOT_PASSWORD ? (
            <ForgotPassword onBack={() => go(LOGIN_VIEW.SIGN_IN)} />
          ) : (
            <Login
              onRegister={() => go(LOGIN_VIEW.REGISTER, "buyer")}
              onForgotPassword={() => go(LOGIN_VIEW.FORGOT_PASSWORD)}
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default LoginTemplate
