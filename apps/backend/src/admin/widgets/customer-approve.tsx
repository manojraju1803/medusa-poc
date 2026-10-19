import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

type CustomerGroup = { id: string; name: string }

type AdminCustomer = {
  id: string
  phone?: string | null
  metadata?: Record<string, unknown> | null
  groups?: CustomerGroup[]
}

const CustomerApproveWidget = ({ data }: { data: AdminCustomer }) => {
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
      await fetch(`/admin/customers/${data.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !approved }),
      })
      setApproved((prev) => !prev)
    } finally {
      setSaving(false)
    }
  }

  const meta = (data.metadata ?? {}) as Record<string, string>

  return (
    <Container>
      <Heading level="h2" className="mb-4">
        IB Approval
      </Heading>

      <div className="grid grid-cols-2 gap-y-2 gap-x-6 mb-4 text-sm">
        {meta.account_type && (
          <div>
            <Text size="small" className="text-ui-fg-muted">
              Account type
            </Text>
            <Text size="small" className="capitalize">
              {meta.account_type}
            </Text>
          </div>
        )}
        {meta.buyer_type && (
          <div>
            <Text size="small" className="text-ui-fg-muted">
              Buyer type
            </Text>
            <Text size="small" className="capitalize">
              {meta.buyer_type}
            </Text>
          </div>
        )}
        {meta.company_name && (
          <div>
            <Text size="small" className="text-ui-fg-muted">
              Company
            </Text>
            <Text size="small">{meta.company_name}</Text>
          </div>
        )}
        {data.phone && (
          <div>
            <Text size="small" className="text-ui-fg-muted">
              Phone
            </Text>
            <Text size="small">{data.phone}</Text>
          </div>
        )}
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
