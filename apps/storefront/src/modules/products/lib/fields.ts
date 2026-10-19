// Fields for product cards (listing, similar products, wishlist, compare).
// `calculated_price` is stripped by the backend for non-approved callers.
export const CARD_FIELDS =
  "id,title,handle,thumbnail,created_at,+metadata,collection.id,collection.title,collection.handle,images.id,images.url,variants.id,variants.metadata,*variants.calculated_price"
