import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

type CustomerGroup = { id: string; name: string }

type AdminCustomer = {
  id: string
  company_name?: string | null
  phone?: string | null
  metadata?: Record<string, unknown> | null
  groups?: CustomerGroup[]
}

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  buyer: "Buyer",
  rnd: "R&D",
  supplier: "Supplier",
}

const CustomerApproveWidget = ({ data }: { data: AdminCustomer }) => {
  const queryClient = useQueryClient()
  const [approved, setApproved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/admin/customers/${data.id}?fields=*groups`)
      .then((r) => r.json())
      .then(({ customer }: { customer: AdminCustomer }) => {
        setApproved(
          customer.groups?.some((g) => g.name === "Approved") ?? false
        )
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [data.id])

  const toggle = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/admin/customers/${data.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !approved }),
      })
      if (response.ok) {
        setApproved((prev) => !prev)
        // The page's Groups section and customer lists, which now show the
        // customer in Approved or Unapproved.
        queryClient.invalidateQueries({ queryKey: ["customers"] })
        queryClient.invalidateQueries({ queryKey: ["customer_groups"] })
      }
    } finally {
      setSaving(false)
    }
  }

  const meta = (data.metadata ?? {}) as Record<string, string>
  const accountType = ACCOUNT_TYPE_LABEL[meta.account_type] ?? "Buyer"
  const location = [meta.city, meta.state, meta.postcode].filter(Boolean).join(", ")

  // Registration details an approver needs, in the order they're checked.
  const details: [string, string | null | undefined][] = [
    ["Account type", accountType],
    ["Company", data.company_name],
    ["Nature of company", meta.company_nature],
    ["GST number", meta.gst_number],
    ["FSSAI licence", meta.fssai_number],
    ["Phone", data.phone],
    ["Telephone", meta.telephone],
    ["Designation", meta.designation],
    ["Location", location],
    ["Registered office", meta.registered_address],
    ["Warehouse / plant", meta.warehouse_address],
    ["Contact address", meta.contact_address],
    ["Nature of business", meta.business_nature],
    ["Brand", meta.brand_name],
    ["Ingredient", meta.ingredient_name],
  ]

  return (
    <Container>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Heading level="h2">IB Approval</Heading>
        <Link to={`/customer-profiles/${data.id}`}>
          <Button size="small" variant="secondary">
            View &amp; edit full profile
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-6 mb-4 text-sm">
        {details
          .filter(([, value]) => !!value)
          .map(([label, value]) => (
            <div key={label} className="min-w-0">
              <Text size="small" className="text-ui-fg-muted">
                {label}
              </Text>
              <Text size="small" className="break-words">
                {value}
              </Text>
            </div>
          ))}
      </div>

      <div className="flex items-center gap-3">
        {!loading && (
          <Badge color={approved ? "green" : "orange"}>
            {approved ? "Approved" : "Pending approval"}
          </Badge>
        )}
        <Button
          size="small"
          variant={approved ? "danger" : "primary"}
          onClick={toggle}
          isLoading={saving || loading}
        >
          {approved ? "Revoke approval" : "Approve"}
        </Button>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.after",
})

export default CustomerApproveWidget
