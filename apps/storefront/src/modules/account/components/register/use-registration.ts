"use client"

import { FormEvent, startTransition, useActionState, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { registerAccount, RegisterState } from "@lib/data/customer"
import {
  AccountRole,
  documentField,
  FieldErrors,
  fieldsForRole,
  FormValues,
  QUALITY_DOCUMENTS,
  validateDocument,
  validateRegistration,
} from "@lib/util/registration"

const focusField = (name: string) => {
  const el = document.querySelector<HTMLElement>(`[name="${name}"]`)
  el?.scrollIntoView({ behavior: "smooth", block: "center" })
  el?.focus({ preventScroll: true })
}

// Form state for the registration forms. Inputs are controlled so values
// survive a failed submit; the same rules run here and in the server action.
export function useRegistration(role: AccountRole) {
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }

  const [values, setValues] = useState<FormValues>(() =>
    Object.fromEntries(fieldsForRole(role).map((f) => [f, ""]))
  )
  const [documents, setDocuments] = useState<(File | null)[]>(() =>
    QUALITY_DOCUMENTS.map(() => null)
  )
  const [errors, setErrors] = useState<FieldErrors>({})

  const [state, dispatch, pending] = useActionState(
    async (prev: RegisterState, formData: FormData): Promise<RegisterState> => {
      const result = await registerAccount(prev, formData)
      if (result?.state === "success") {
        router.push(`/${countryCode}/account?welcome=1`)
        router.refresh()
      }
      return result
    },
    null
  )

  useEffect(() => {
    if (state?.state !== "error") return
    const serverErrors = state.fieldErrors ?? {}
    setErrors(serverErrors)
    const first = Object.keys(serverErrors)[0]
    if (first) focusField(first)
  }, [state])

  const clearError = (name: string) =>
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })

  const setValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    clearError(name)
  }

  const setDocument = (index: number, file: File | null) => {
    setDocuments((prev) => prev.map((f, i) => (i === index ? file : f)))
    const error = validateDocument(file)
    const name = documentField(index)
    if (error) setErrors((prev) => ({ ...prev, [name]: error }))
    else clearError(name)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const found = validateRegistration(role, values)
    documents.forEach((file, i) => {
      const error = validateDocument(file)
      if (error) found[documentField(i)] = error
    })
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      focusField(first)
      return
    }

    const formData = new FormData()
    formData.set("account_type", role)
    for (const [key, value] of Object.entries(values)) formData.set(key, value)
    documents.forEach((file, i) => file && formData.set(documentField(i), file))
    startTransition(() => dispatch(formData))
  }

  const hasErrors = Object.keys(errors).length > 0
  const formError =
    state?.state === "error" && !Object.keys(state.fieldErrors ?? {}).length
      ? state.error
      : null

  return {
    values,
    setValue,
    documents,
    setDocument,
    errors,
    hasErrors,
    formError,
    state,
    pending,
    submit,
  }
}
