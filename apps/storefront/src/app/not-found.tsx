import { Metadata } from "next"

import NotFoundMessage from "@modules/common/components/not-found-message"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default function NotFound() {
  return <NotFoundMessage localized={false} />
}
