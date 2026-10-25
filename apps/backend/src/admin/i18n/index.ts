import en from "./json/en.json"

// Merged over the admin's own texts, so a key here replaces Medusa's text.
// products.media.failedToUpload: the product media editor shows this fixed
// text when an upload fails, never the server's message, so it states the
// upload rules (see src/api/admin/uploads/middlewares.ts).
export default {
  en: {
    translation: en,
  },
}
