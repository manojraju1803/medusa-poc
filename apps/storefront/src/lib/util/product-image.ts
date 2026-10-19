// the site's own filler graphic, used as the image on products with no photo
const GENERIC_CATALOGUE_IMAGE_URL =
  "https://www.ingredientsbazar.com/wp-content/uploads/2018/09/ingredients-bazar.jpg"

export const isRealProductImageUrl = (url?: string | null): url is string =>
  !!url && url !== GENERIC_CATALOGUE_IMAGE_URL
