type MedusaError = {
  response?: {
    data: { message?: string } | string
    status: number
    headers: unknown
  }
  request?: unknown
  message?: string
  // Set by the v2 js-sdk's FetchError
  status?: number
  config?: { url: string; baseURL: string }
}

// Capitalise, and end with a full stop unless the message already has one.
const toSentence = (message: string) => {
  const capitalised = message.charAt(0).toUpperCase() + message.slice(1)
  return /[.!?]$/.test(capitalised) ? capitalised : capitalised + "."
}

export default function medusaError(error: unknown): never {
  const err = error as MedusaError

  // The v2 js-sdk throws a FetchError: the server responded, its message is on
  // `message` and the HTTP status on `status`. It has no `response` or
  // `request`, so without this branch every server error fell through to
  // "Error setting up the request".
  if (err.status) {
    console.error("Status code:", err.status, "Message:", err.message)
    throw new Error(toSentence(err.message || "An unknown error occurred"))
  }

  if (err.response) {
    const u = new URL(err.config?.url ?? "", err.config?.baseURL ?? "")
    console.error("Resource:", u.toString())
    console.error("Response data:", err.response.data)
    console.error("Status code:", err.response.status)
    console.error("Headers:", err.response.headers)

    const data = err.response.data
    const message =
      typeof data === "string" ? data : data.message || String(data)

    throw new Error(toSentence(message))
  } else if (err.request) {
    throw new Error("No response received: " + String(err.request))
  } else {
    throw new Error("Error setting up the request: " + err.message)
  }
}
