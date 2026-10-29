import { NOINDEX } from "@lib/util/seo"
import { Metadata } from "next"

// Order confirmation and order transfer pages are private to one buyer.
export const metadata: Metadata = {
  robots: NOINDEX,
}

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
