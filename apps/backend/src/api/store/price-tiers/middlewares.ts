import {
  MiddlewareRoute,
  validateAndTransformQuery,
} from '@medusajs/framework/http';
import { z } from '@medusajs/framework/zod';

export const StoreGetPriceTiersParams = z.object({
  // One product (the product page) or several (the cart).
  product_id: z.union([
    z.string().min(1),
    z.array(z.string().min(1)).min(1).max(100),
  ]),
  region_id: z.string().min(1),
});

export type StoreGetPriceTiersParams = z.infer<typeof StoreGetPriceTiersParams>;

export const priceTierMiddlewares: MiddlewareRoute[] = [
  {
    method: ['GET'],
    matcher: '/store/price-tiers',
    middlewares: [validateAndTransformQuery(StoreGetPriceTiersParams, {})],
  },
];
