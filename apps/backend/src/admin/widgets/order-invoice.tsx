import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useState } from "react"

// Opens the order's tax invoice: the storefront's printable page, through a
// short-lived link, so the admin sees exactly what the buyer gets.
const OrderInvoiceWidget = ({ data }: { data: { id: string } }) => {
  const [opening, setOpening] = useState(false)

  const open = async () => {
    // Opened before the request so the browser doesn't block it as a pop-up
    const tab = window.open("", "_blank")
    setOpening(true)
    try {
      const response = await fetch(`/admin/orders/${data.id}/invoice-link`, {
        method: "POST",
      })
      const body = await response.json()
      if (!response.ok) {
        throw new Error(body.message ?? "Could not open the invoice")
      }
      if (tab) {
        tab.opener = null
        tab.location.href = body.url
      } else {
        window.location.href = body.url
      }
    } catch (error) {
      tab?.close()
      toast.error((error as Error).message)
    } finally {
      setOpening(false)
    }
  }

  return (
    <Container className="flex items-center justify-between gap-3">
      <div>
        <Heading level="h2">Invoice</Heading>
        <Text size="small" className="text-ui-fg-muted">
          GST tax invoice, as the buyer sees it
        </Text>
      </div>
      <Button size="small" variant="secondary" onClick={open} isLoading={opening}>
        View invoice
      </Button>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default OrderInvoiceWidget
