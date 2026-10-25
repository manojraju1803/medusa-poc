"use client"

import { signout } from "@lib/data/customer"
import { LogoutIcon } from "@modules/layout/components/ib-icons"
import { useParams } from "next/navigation"

const LogoutButton = () => {
  const { countryCode } = useParams()

  return (
    <button
      type="button"
      onClick={() => signout(countryCode as string)}
      data-testid="nav-logout-button"
      className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
    >
      <LogoutIcon className="w-4 h-4 shrink-0" />
      Logout
    </button>
  )
}

export default LogoutButton
