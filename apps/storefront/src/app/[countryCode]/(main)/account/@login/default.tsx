import { Suspense } from "react"
import LoginTemplate from "@modules/account/templates/login-template"

export default function LoginDefault() {
  return (
    <Suspense fallback={null}>
      <LoginTemplate />
    </Suspense>
  )
}
