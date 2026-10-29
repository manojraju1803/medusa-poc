"use client"

import { startTransition, useActionState, useEffect, useState } from "react"

import { DocumentsSaveState, updateMyDocuments } from "@lib/data/profile"
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_HINT,
  documentField,
  QUALITY_DOCUMENTS,
  StoredDocument,
  validateDocument,
} from "@lib/util/registration"
import { openLocalFile } from "@lib/util/open-local-file"
import { ghostButton, primaryButton, ProfileCard } from "./section-card"

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null

// Supplier quality documents: view, upload, replace or remove, saved together.
const DocumentsCard = ({ documents: initial }: { documents: StoredDocument[] }) => {
  const [documents, setDocuments] = useState(initial)
  const [picked, setPicked] = useState<(File | null)[]>(QUALITY_DOCUMENTS.map(() => null))
  const [removing, setRemoving] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, dispatch, pending] = useActionState<DocumentsSaveState, FormData>(
    updateMyDocuments,
    null
  )

  useEffect(() => setDocuments(initial), [initial])

  useEffect(() => {
    if (state?.state === "saved") {
      setDocuments(state.documents)
      setPicked(QUALITY_DOCUMENTS.map(() => null))
      setRemoving(new Set())
      setErrors({})
    } else if (state?.state === "error") {
      setErrors(state.fieldErrors ?? {})
    }
  }, [state])

  const byLabel = new Map(documents.map((d) => [d.label, d]))
  const dirty = picked.some(Boolean) || removing.size > 0

  const pick = (i: number, file: File | null) => {
    setPicked((prev) => prev.map((f, j) => (j === i ? file : f)))
    const error = validateDocument(file)
    setErrors((prev) => {
      const next = { ...prev }
      if (error) next[documentField(i)] = error
      else delete next[documentField(i)]
      return next
    })
    if (file) {
      setRemoving((prev) => {
        const next = new Set(prev)
        next.delete(QUALITY_DOCUMENTS[i])
        return next
      })
    }
  }

  const toggleRemove = (label: string) =>
    setRemoving((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })

  const save = () => {
    if (Object.keys(errors).length) return
    const formData = new FormData()
    picked.forEach((file, i) => file && formData.set(documentField(i), file))
    removing.forEach((label) => formData.append("remove", label))
    startTransition(() => dispatch(formData))
  }

  const reset = () => {
    setPicked(QUALITY_DOCUMENTS.map(() => null))
    setRemoving(new Set())
    setErrors({})
  }

  return (
    <ProfileCard
      title="Quality Documents"
      subtitle="PDF, Word, JPG or PNG. Maximum file size 2 MB each. A new upload replaces the existing file for that document."
    >
      <ul className="grid sm:grid-cols-2 gap-3">
        {QUALITY_DOCUMENTS.map((label, i) => {
          const current = byLabel.get(label)
          const file = picked[i]
          const markedForRemoval = removing.has(label)
          const error = errors[documentField(i)]
          const id = `profile-doc-${i}`
          return (
            <li
              key={label}
              className={`rounded-xl border p-4 min-w-0 ${
                error ? "border-red-300" : markedForRemoval ? "border-amber-300 bg-amber-50/40" : "border-[#e5e7eb]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#1e293b]">{label}</div>
                  {current && !markedForRemoval ? (
                    <div className="mt-1 truncate text-xs font-semibold text-[#334155]" title={current.filename}>
                      {current.filename}
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-[#94a3b8] italic">
                      {markedForRemoval ? "Will be removed when you save" : "Not uploaded"}
                    </div>
                  )}
                  {current && !markedForRemoval && formatDate(current.uploaded_at) && (
                    <div className="text-[10px] text-[#94a3b8] mt-0.5">
                      Uploaded {formatDate(current.uploaded_at)}
                    </div>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    current && !markedForRemoval ? "bg-[#dcfce7] text-[#166534]" : "bg-gray-100 text-[#64748b]"
                  }`}
                >
                  {current && !markedForRemoval ? "On file" : "Missing"}
                </span>
              </div>

              <p className="mt-2 text-[10px] text-[#94a3b8]">{DOCUMENT_HINT}</p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {current && !markedForRemoval && !file && (
                  <a
                    href={current.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center h-8 px-3 rounded-lg border border-[#0757a8]/40 text-[11px] font-bold text-[#0757a8] hover:bg-[#eff6ff] transition-colors"
                  >
                    View
                  </a>
                )}
                <label
                  htmlFor={id}
                  className="cursor-pointer inline-flex items-center h-8 px-3 rounded-lg bg-[#0757a8] hover:bg-[#064985] text-white text-[11px] font-bold transition-colors"
                >
                  {current ? "Replace" : "Upload"}
                </label>
                <input
                  id={id}
                  type="file"
                  accept={DOCUMENT_ACCEPT}
                  className="sr-only"
                  onChange={(e) => {
                    pick(i, e.target.files?.[0] ?? null)
                    e.target.value = ""
                  }}
                />
                {current && !file && (
                  <button
                    type="button"
                    onClick={() => toggleRemove(label)}
                    className="h-8 px-3 rounded-lg border border-[#cbd5e1] text-[11px] font-bold text-[#475569] hover:border-red-300 hover:text-red-600 transition-colors"
                  >
                    {markedForRemoval ? "Keep" : "Remove"}
                  </button>
                )}
                {file && (
                  <span className="min-w-0 flex items-center gap-1.5 text-[11px] font-semibold text-[#166534]">
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => openLocalFile(file)}
                      className="shrink-0 h-6 px-2 rounded-md border border-[#0757a8]/40 text-[10px] font-bold text-[#0757a8] hover:bg-[#eff6ff]"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => pick(i, null)}
                      aria-label={`Clear ${label}`}
                      className="text-[#94a3b8] hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
              {error && <p className="mt-2 text-[11px] font-medium text-red-600">{error}</p>}
            </li>
          )
        })}
      </ul>

      {state?.state === "error" && !state.fieldErrors && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state?.state === "saved" && !dirty && (
        <p role="status" className="mt-4 text-xs font-semibold text-[#166534]">
          Documents saved.
        </p>
      )}
      {dirty && (
        <div className="flex flex-wrap gap-3 mt-5">
          <button type="button" onClick={save} disabled={pending} className={primaryButton}>
            {pending ? "Saving…" : "Save documents"}
          </button>
          <button type="button" onClick={reset} disabled={pending} className={ghostButton + " h-10"}>
            Cancel
          </button>
        </div>
      )}
    </ProfileCard>
  )
}

export default DocumentsCard
