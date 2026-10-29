import React from "react"

export const fieldClass =
  "w-full px-3.5 py-2.5 text-sm text-[#0f172a] border border-gray-200 rounded-lg outline-none transition-all bg-white focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/10"

type AuthFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  name: string
}

const AuthField = ({ label, required, ...props }: AuthFieldProps) => (
  <div>
    <label
      htmlFor={props.id || props.name}
      className="block text-xs font-semibold text-[#374151] mb-1.5"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={props.id || props.name}
      required={required}
      className={fieldClass}
      {...props}
    />
  </div>
)

export const AuthError = ({ error }: { error?: string | null }) =>
  error ? (
    <div
      className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
      data-testid="auth-error"
    >
      {error.replace(/^Error:\s*/, "")}
    </div>
  ) : null

export const SubmitAuthButton = ({
  pending,
  children,
  pendingLabel,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pending: boolean
  pendingLabel: string
}) => (
  <button
    type="submit"
    disabled={pending}
    className="w-full py-3 bg-[#166534] hover:bg-[#14532d] disabled:opacity-70 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
    {...props}
  >
    {pending ? pendingLabel : children}
  </button>
)

export default AuthField
