"use client"

import { signout } from "@lib/data/customer"
import { useParams } from "next/navigation"

const LogoutButton = () => {
  const { countryCode } = useParams()

  return (
    <button
      type="button"
      onClick={() => signout(countryCode as string)}
      data-testid="nav-logout-button"
      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
    >
      Logout
    </button>
  )
}

export default LogoutButton
