import { HttpTypes } from "@medusajs/types";

export const PRODUCT_CARD_FIELDS =
    "id,title,handle,thumbnail,created_at,*images,variants.id,*variants.calculated_price";

export const isSimpleProduct = (product: HttpTypes.StoreProduct): boolean => {
    return product.options?.length === 1 && product.options[0].values?.length === 1;
}