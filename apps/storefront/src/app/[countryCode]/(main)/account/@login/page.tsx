import { Metadata } from "next"
import { Suspense } from "react"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your IngredientsBazar account.",
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginTemplate />
    </Suspense>
  )
}
