// Product descriptions were imported from the old WordPress site and some
// carry plugin markup: inline <script> blocks (which run on page load and throw
// "$ is not a function"), <iframe>/<object>/<embed>, inline on* handlers and
// javascript: URLs. Strip all of those before the HTML is rendered.
export const safeDescriptionHtml = (html?: string | null) =>
  (html ?? "")
    .replace(/<(script|style|iframe|object|embed)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|iframe|object|embed)\b[^>]*\/?>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"')
