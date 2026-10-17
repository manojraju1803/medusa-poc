import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Select,
  Table,
  Text,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

type Inquiry = {
  id: string
  type: "quote_sample" | "contact" | "supplier_registration"
  status: "new" | "in_progress" | "closed"
  name: string
  email: string
  phone?: string | null
  company?: string | null
  message?: string | null
  product_id?: string | null
  quantity?: number | null
  unit?: string | null
  wants_quote: boolean
  wants_sample: boolean
  created_at: string
}

const TYPE_LABELS: Record<Inquiry["type"], string> = {
  quote_sample: "Quote / Sample",
  contact: "Contact",
  supplier_registration: "Supplier Reg.",
}

const STATUS_COLOR: Record<
  Inquiry["status"],
  "blue" | "orange" | "grey"
> = {
  new: "blue",
  in_progress: "orange",
  closed: "grey",
}

const InquiriesPage = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = (type?: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (type && type !== "all") params.set("type", type)
    fetch(`/admin/inquiries?${params}`)
      .then((r) => r.json())
      .then(({ inquiries: data }: { inquiries: Inquiry[] }) => {
        setInquiries(data ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const applyTypeFilter = (val: string) => {
    setTypeFilter(val)
    load(val)
  }

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    await fetch(`/admin/inquiries/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === id ? { ...inq, status: status as Inquiry["status"] } : inq
      )
    )
    setUpdatingId(null)
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Inquiries</Heading>
        <div className="flex items-center gap-3">
          <Text size="small" className="text-ui-fg-muted">
            Filter by type:
          </Text>
          <Select value={typeFilter} onValueChange={applyTypeFilter}>
            <Select.Trigger>
              <Select.Value placeholder="All types" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All types</Select.Item>
              <Select.Item value="quote_sample">Quote / Sample</Select.Item>
              <Select.Item value="contact">Contact</Select.Item>
              <Select.Item value="supplier_registration">
                Supplier Registration
              </Select.Item>
            </Select.Content>
          </Select>
          <Button variant="secondary" size="small" onClick={() => load(typeFilter)}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <Text className="text-ui-fg-muted py-8 text-center">Loading…</Text>
      ) : inquiries.length === 0 ? (
        <Text className="text-ui-fg-muted py-8 text-center">
          No inquiries found.
        </Text>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Company</Table.HeaderCell>
              <Table.HeaderCell>Product / Qty</Table.HeaderCell>
              <Table.HeaderCell>Flags</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {inquiries.map((inq) => (
              <Table.Row key={inq.id}>
                <Table.Cell>
                  <Badge color="blue">{TYPE_LABELS[inq.type]}</Badge>
                </Table.Cell>
                <Table.Cell>{inq.name}</Table.Cell>
                <Table.Cell>
                  <Text size="small" className="text-ui-fg-muted">
                    {inq.email}
                  </Text>
                </Table.Cell>
                <Table.Cell>{inq.company ?? "—"}</Table.Cell>
                <Table.Cell>
                  {inq.product_id ? (
                    <Text size="small">
                      {inq.quantity
                        ? `${inq.quantity} ${inq.unit ?? ""}`
                        : "—"}
                    </Text>
                  ) : (
                    "—"
                  )}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    {inq.wants_quote && (
                      <Badge color="purple">Quote</Badge>
                    )}
                    {inq.wants_sample && (
                      <Badge color="green">Sample</Badge>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Select
                    value={inq.status}
                    onValueChange={(val) => updateStatus(inq.id, val)}
                    disabled={updatingId === inq.id}
                  >
                    <Select.Trigger>
                      <Badge color={STATUS_COLOR[inq.status]}>
                        {inq.status.replace("_", " ")}
                      </Badge>
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="new">new</Select.Item>
                      <Select.Item value="in_progress">in progress</Select.Item>
                      <Select.Item value="closed">closed</Select.Item>
                    </Select.Content>
                  </Select>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small" className="text-ui-fg-muted">
                    {new Date(inq.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Inquiries",
})

export default InquiriesPage
