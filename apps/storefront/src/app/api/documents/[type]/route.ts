import { getAuthHeaders } from "@lib/data/cookies"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

// Opens one of the signed-in customer's documents, e.g. /api/documents/coa-form.
// The customer's login token is in a storefront cookie, so a plain link to the
// backend can't prove who's asking: this route adds the token, and the
// backend answers with a redirect to a link that works for 5 minutes.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  const auth = await getAuthHeaders()
  if (!("authorization" in auth)) {
    return new NextResponse("Please sign in to open your documents.", {
      status: 401,
    })
  }

  const response = await fetch(
    `${BACKEND_URL}/store/customers/me/documents/${encodeURIComponent(type)}`,
    {
      headers: {
        ...auth,
        "x-publishable-api-key":
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
      },
      redirect: "manual",
      cache: "no-store",
    }
  ).catch(() => null)

  const location = response?.headers.get("location")
  if (response && response.status >= 300 && response.status < 400 && location) {
    return NextResponse.redirect(location, {
      headers: { "Cache-Control": "no-store" },
    })
  }

  if (response?.status === 404) {
    return new NextResponse("This document isn't available.", { status: 404 })
  }
  if (response?.status === 401) {
    return new NextResponse("Please sign in to open your documents.", {
      status: 401,
    })
  }
  // The backend failed or couldn't be reached: signing in again wouldn't help.
  return new NextResponse("Couldn't open the document. Please try again.", {
    status: 502,
  })
}
