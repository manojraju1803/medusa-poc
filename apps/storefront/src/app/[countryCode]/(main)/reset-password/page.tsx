import { Metadata } from "next"

import ResetPasswordForm from "@modules/account/components/reset-password"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Reset password | IngredientsBazar",
  description: "Set a new password for your Ingredients Bazar account.",
  robots: { index: false },
}

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string; email?: string }>
}) {
  const { token = "", email = "" } = await props.searchParams

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#00254d] text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/home-hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#00254d]/[.95] via-[#00356e]/[.86] to-[#2f5d1a]/[.78]" />
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 py-14 grid lg:grid-cols-[1fr_440px] gap-10 items-center">
        <div className="max-w-xl">
          <LocalizedClientLink href="/" className="inline-flex bg-white rounded-xl px-3 py-2 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-hd.png" alt="Ingredients Bazar" className="h-8 sm:h-9 w-auto" />
          </LocalizedClientLink>
          <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-[#c5e39a]">
            Account security
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-[1.1]">
            Reset your <span className="text-[#7aba0c]">password</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/75 leading-relaxed">
            Choose a new password for your Ingredients Bazar account. Reset
            links work once and expire 15 minutes after they are sent.
          </p>
        </div>
        <div className="w-full max-w-[440px] mx-auto lg:mx-0">
          <ResetPasswordForm token={token} email={email} />
        </div>
      </div>
    </section>
  )
}
