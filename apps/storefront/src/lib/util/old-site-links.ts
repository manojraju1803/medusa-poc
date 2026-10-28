// Product descriptions imported from the old WordPress site still link to it
// (mostly PDF spec sheets under /wp-content/). Rewrite those links to the same
// path on this site, which has no such pages, so a click lands on our 404
// instead of opening the old website.
const OLD_SITE_URL = /\b(href|src)=(["'])https?:\/\/(?:www\.)?ingredients?bazar\.com(\/[^"']*)?\2/gi

export const withoutOldSiteLinks = (html: string, countryCode: string) =>
  html.replace(
    OLD_SITE_URL,
    (_match, attr: string, quote: string, path?: string) =>
      `${attr}=${quote}/${countryCode}${path ?? "/"}${quote}`
  )
