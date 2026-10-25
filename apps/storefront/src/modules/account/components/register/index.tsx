"use client"

import { AccountRole } from "@lib/util/registration"
import BuyerForm from "./buyer-form"
import SupplierForm from "./supplier-form"

const Register = ({
  role,
  onRoleChange,
  onSignIn,
}: {
  role: AccountRole
  onRoleChange: (role: AccountRole) => void
  onSignIn: () => void
}) =>
  role === "supplier" ? (
    <SupplierForm onRoleChange={onRoleChange} onSignIn={onSignIn} />
  ) : (
    // Keyed so switching Buyer <-> R&D starts a fresh form.
    <BuyerForm key={role} role={role} onRoleChange={onRoleChange} onSignIn={onSignIn} />
  )

export default Register
