import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import {
  ACCOUNT_TYPE_LABEL,
  AccountType,
  accountTypeOf,
  documentsOf,
  normalize,
  QUALITY_DOCUMENTS,
  Section,
  sectionsFor,
  updateBody,
  validate,
  Values,
  valuesOf,
} from "../../../lib/customer-profile"

type Customer = {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  company_name?: string | null
  has_account: boolean
  created_at: string
  metadata?: Record<string, unknown> | null
  groups?: { id: string; name: string }[]
}

const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.message ?? `Request failed (${res.status})`)
  return body as T
}

const loadCustomer = (id: string) =>
  api<{ customer: Customer }>(`/admin/customers/${id}?fields=*groups`).then((r) => r.customer)

const saveCustomer = (id: string, body: Record<string, unknown>) =>
  api<{ customer: Customer }>(`/admin/customers/${id}?fields=*groups`, {
    method: "POST",
    body: JSON.stringify(body),
  }).then((r) => r.customer)

const Field = ({
  def,
  value,
  error,
  onChange,
}: {
  def: Section["fields"][number]
  value: string
  error?: string
  onChange: (value: string) => void
}) => {
  const id = `field-${def.key}`
  return (
    <div className={`flex flex-col gap-y-1.5 ${def.textarea ? "col-span-2" : ""}`}>
      <Label htmlFor={id} size="small" weight="plus">
        {def.label}
        {def.required && <span className="text-ui-fg-error"> *</span>}
      </Label>
      {def.options ? (
        <Select value={value || undefined} onValueChange={onChange}>
          <Select.Trigger id={id} aria-invalid={!!error}>
            <Select.Value placeholder={`Select ${def.label.toLowerCase()}`} />
          </Select.Trigger>
          <Select.Content>
            {def.options.map((o) => (
              <Select.Item key={o} value={o}>
                {o}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      ) : def.textarea ? (
        <Textarea id={id} value={value} rows={2} aria-invalid={!!error} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input id={id} value={value} aria-invalid={!!error} onChange={(e) => onChange(e.target.value)} />
      )}
      {error && (
        <Text size="xsmall" className="text-ui-fg-error">
          {error}
        </Text>
      )}
    </div>
  )
}

const SectionBlock = ({
  section,
  customer,
  onSaved,
}: {
  section: Section
  customer: Customer
  onSaved: (c: Customer) => void
}) => {
  const initial = valuesOf(customer)
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState<Values>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const start = () => {
    setValues(valuesOf(customer))
    setErrors({})
    setMessage(null)
    setEditing(true)
  }

  const save = async () => {
    const found = validate(section.fields, values)
    setErrors(found)
    if (Object.keys(found).length) return
    setSaving(true)
    try {
      const updated = await saveCustomer(
        customer.id,
        updateBody(section.fields, values, customer.metadata ?? {})
      )
      onSaved(updated)
      setEditing(false)
      setMessage("Saved")
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{section.title}</Heading>
        <div className="flex items-center gap-x-2">
          {message && !editing && (
            <Text size="small" className="text-ui-fg-subtle">
              {message}
            </Text>
          )}
          {editing ? (
            <>
              <Button size="small" variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </Button>
              <Button size="small" onClick={save} isLoading={saving}>
                Save
              </Button>
            </>
          ) : (
            <Button size="small" variant="secondary" onClick={start}>
              Edit
            </Button>
          )}
        </div>
      </div>
      {editing ? (
        <div className="grid grid-cols-2 gap-4 px-6 py-4">
          {section.fields.map((f) => (
            <Field
              key={f.key}
              def={f}
              value={values[f.key] ?? ""}
              error={errors[f.key]}
              onChange={(v) => {
                setValues((prev) => ({ ...prev, [f.key]: v }))
                setErrors((prev) => {
                  const next = { ...prev }
                  delete next[f.key]
                  return next
                })
              }}
            />
          ))}
          {message && (
            <Text size="small" className="col-span-2 text-ui-fg-error">
              {message}
            </Text>
          )}
        </div>
      ) : (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-6 py-4">
          {section.fields.map((f) => (
            <div key={f.key} className={`min-w-0 ${f.textarea ? "col-span-2" : ""}`}>
              <Text size="small" className="text-ui-fg-subtle">
                {f.label}
              </Text>
              <Text size="small" className={`break-words ${initial[f.key] ? "" : "text-ui-fg-muted"}`}>
                {normalize(f.key, initial[f.key] ?? "") || "–"}
              </Text>
            </div>
          ))}
        </dl>
      )}
    </Container>
  )
}

const CustomerProfilePage = () => {
  const { id = "" } = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const refresh = useCallback(() => {
    loadCustomer(id)
      .then(setCustomer)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load the customer"))
  }, [id])

  useEffect(refresh, [refresh])

  if (error) {
    return (
      <Container>
        <Text>{error}</Text>
      </Container>
    )
  }
  if (!customer) {
    return (
      <Container>
        <Text className="text-ui-fg-subtle">Loading profile…</Text>
      </Container>
    )
  }

  const type = accountTypeOf(customer.metadata)
  const approved = customer.groups?.some((g) => g.name === "Approved") ?? false
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ")
  const documents = documentsOf(customer.metadata)
  const docByLabel = new Map(documents.map((d) => [d.label, d]))
  const extraDocs = documents.filter((d) => !QUALITY_DOCUMENTS.includes(d.label))

  const changeType = async (next: string) => {
    if (next === type) return
    setBusy("type")
    try {
      // The customer-account-type-group subscriber moves them to the matching
      // Buyer / R&D / Supplier group; reload once it has run.
      await saveCustomer(customer.id, {
        metadata: { ...(customer.metadata ?? {}), account_type: next },
      })
      setTimeout(refresh, 800)
    } finally {
      setBusy(null)
    }
  }

  const toggleApproval = async () => {
    setBusy("approve")
    try {
      await api(`/admin/customers/${customer.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ approved: !approved }),
      })
      refresh()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-4">
          <div className="min-w-0">
            <Link to={`/customers/${customer.id}`} className="text-ui-fg-interactive txt-compact-small">
              ← Back to customer
            </Link>
            <Heading level="h1" className="mt-2 break-words">
              {customer.company_name || name || customer.email}
            </Heading>
            <Text size="small" className="text-ui-fg-subtle break-words">
              {[name, customer.email].filter(Boolean).join(" · ")}
            </Text>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="blue">{ACCOUNT_TYPE_LABEL[type]}</Badge>
            <Badge color={approved ? "green" : "orange"}>{approved ? "Approved" : "Pending approval"}</Badge>
            <Button size="small" variant={approved ? "danger" : "primary"} onClick={toggleApproval} isLoading={busy === "approve"}>
              {approved ? "Revoke approval" : "Approve"}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-cols-4">
          <div className="flex flex-col gap-y-1.5">
            <Label size="small" weight="plus">Account type</Label>
            <Select value={type} onValueChange={changeType} disabled={busy === "type"}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {(Object.keys(ACCOUNT_TYPE_LABEL) as AccountType[]).map((t) => (
                  <Select.Item key={t} value={t}>
                    {ACCOUNT_TYPE_LABEL[t]}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">Groups</Text>
            <Text size="small">{customer.groups?.map((g) => g.name).join(", ") || "–"}</Text>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">Registered</Text>
            <Text size="small">{new Date(customer.created_at).toLocaleDateString("en-IN")}</Text>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">Terms accepted</Text>
            <Text size="small">
              {typeof customer.metadata?.terms_accepted_at === "string"
                ? new Date(customer.metadata.terms_accepted_at).toLocaleDateString("en-IN")
                : "–"}
            </Text>
          </div>
        </div>
      </Container>

      {sectionsFor(type).map((section) => (
        <SectionBlock key={`${type}-${section.key}`} section={section} customer={customer} onSaved={setCustomer} />
      ))}

      {(type === "supplier" || documents.length > 0) && (
        <Container className="divide-y p-0">
          <div className="px-6 py-4">
            <Heading level="h2">Quality documents</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Uploaded by the supplier at registration or from their profile.
            </Text>
          </div>
          <ul className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-2">
            {[...QUALITY_DOCUMENTS.map((label) => ({ label, doc: docByLabel.get(label) })), ...extraDocs.map((d) => ({ label: d.label, doc: d }))].map(
              ({ label, doc }) => (
                <li key={label} className="flex items-center justify-between gap-3 rounded-lg border border-ui-border-base px-4 py-3">
                  <div className="min-w-0">
                    <Text size="small" weight="plus">{label}</Text>
                    <Text size="xsmall" className={`truncate ${doc ? "text-ui-fg-subtle" : "text-ui-fg-muted"}`}>
                      {doc ? doc.filename : "Not uploaded"}
                    </Text>
                  </div>
                  {doc ? (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Button size="small" variant="secondary">View</Button>
                    </a>
                  ) : (
                    <Badge color="grey">Missing</Badge>
                  )}
                </li>
              )
            )}
          </ul>
        </Container>
      )}
    </div>
  )
}

export default CustomerProfilePage
