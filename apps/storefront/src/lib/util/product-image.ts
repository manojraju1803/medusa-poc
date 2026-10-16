export const isRealProductImageUrl = (url?: string | null): url is string =>
  !!url && typeof url === "string" && url.trim().length > 0
