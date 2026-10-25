"use client"

import { useState } from "react"

type Props = {
  name: string
  label: string
  value: string
  onChange: (name: string, value: string) => void
  error?: string
  required?: boolean
  type?: "text" | "email" | "tel" | "password"
  placeholder?: string
  options?: string[]
  textarea?: boolean
  help?: string
  autoComplete?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  maxLength?: number
  // Strips everything but digits as the user types.
  digitsOnly?: boolean
}

const LinesIcon = () => (
  <svg className="w-4 h-4 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 7h16M4 12h16M4 17h10" />
  </svg>
)

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.5" />
    {!open && <path strokeLinecap="round" strokeWidth={1.8} d="M4 4l16 16" />}
  </svg>
)

const RegField = ({
  name,
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
  placeholder,
  options,
  textarea,
  help,
  autoComplete,
  inputMode,
  maxLength = 200,
  digitsOnly,
}: Props) => {
  const change = (value: string) =>
    onChange(name, digitsOnly ? value.replace(/\D/g, "") : value)

  const [visible, setVisible] = useState(false)
  const id = `reg-${name}`
  const errorId = `${id}-error`
  const isPassword = type === "password"
  const border = error
    ? "border-red-400 focus:border-red-500"
    : "border-[#cbd5e1] focus:border-[#0077cf]"
  const shared = {
    id,
    name,
    value,
    required,
    "aria-invalid": !!error || undefined,
    "aria-describedby": error ? errorId : undefined,
  }

  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-semibold text-[#1e293b] mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
        {help && (
          <span className="relative group inline-flex" title={help}>
            <span className="w-4 h-4 rounded-full border border-[#94a3b8] text-[#64748b] flex items-center justify-center text-[10px] font-bold cursor-help">
              ?
            </span>
            <span className="pointer-events-none absolute left-1/2 bottom-6 -translate-x-1/2 hidden group-hover:block w-52 rounded-lg bg-[#0f172a] px-3 py-2 text-[10px] font-normal leading-relaxed text-white z-20">
              {help}
            </span>
          </span>
        )}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-3.5 pointer-events-none">
          <LinesIcon />
        </span>
        {options ? (
          <select
            {...shared}
            onChange={(e) => onChange(name, e.target.value)}
            className={`w-full h-11 pl-10 pr-3 bg-white border rounded-lg text-sm text-[#0f172a] outline-none transition-colors ${border}`}
          >
            <option value="">Select {label}</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : textarea ? (
          <textarea
            {...shared}
            onChange={(e) => change(e.target.value)}
            placeholder={placeholder}
            rows={1}
            maxLength={maxLength}
            className={`w-full h-11 pl-10 pr-3 py-[11px] leading-5 bg-white border rounded-lg text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none resize-none overflow-y-auto no-scrollbar transition-colors ${border}`}
          />
        ) : (
          <input
            {...shared}
            type={isPassword && visible ? "text" : type}
            onChange={(e) => change(e.target.value)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            inputMode={inputMode}
            maxLength={maxLength}
            className={`w-full h-11 pl-10 ${isPassword ? "pr-11" : "pr-3"} bg-white border rounded-lg text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition-colors ${border}`}
          />
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 w-7 h-7 flex items-center justify-center text-[#64748b] hover:text-[#0077cf]"
          >
            <EyeIcon open={visible} />
          </button>
        )}
      </div>
      {error && (
        <span id={errorId} className="block text-[11px] font-medium text-red-600 mt-1.5">
          {error}
        </span>
      )}
    </div>
  )
}

export default RegField
