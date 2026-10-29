// Where to send a buyer after sign-in, carried as `?next=` on the account page.

// Only paths on this site, so the link can't send anyone elsewhere.
export const safeReturnPath = (value: unknown): string | null =>
  typeof value === "string" && /^\/(?![/\\])/.test(value) ? value : null

// The sign-in page, returning to `path` afterwards.
export const loginPath = (countryCode: string, path: string) =>
  `/${countryCode}/account?next=${encodeURIComponent(path)}`
