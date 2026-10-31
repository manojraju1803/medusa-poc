// Pages visited in this tab since the storefront loaded, so Back buttons can
// tell "came from another page here" (go back) from "landed here directly"
// (go to a sensible page instead of leaving the site).
let pagesSeen = 0
let lastPath: string | null = null

export const recordPage = (path: string) => {
  if (path === lastPath) return
  lastPath = path
  pagesSeen += 1
}

export const hasEarlierPage = () => pagesSeen > 1
