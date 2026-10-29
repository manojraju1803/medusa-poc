import { Metadata } from "next"

import NotFoundMessage from "@modules/common/components/not-found-message"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default function NotFound() {
  return (
    <NotFoundMessage message="The cart you tried to access does not exist. Clear your cookies and try again." />
  )
}
