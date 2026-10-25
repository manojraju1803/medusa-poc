// Opens a file the user has picked (not yet uploaded) in a new tab, so they can
// check it before saving. Browsers show PDFs and images; Word files download.
export const openLocalFile = (file: File) => {
  const url = URL.createObjectURL(file)
  window.open(url, "_blank", "noopener,noreferrer")
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
