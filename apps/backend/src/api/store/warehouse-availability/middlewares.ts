import {
  MiddlewareRoute,
  authenticate,
  validateAndTransformQuery,
} from '@medusajs/framework/http';
import { z } from '@medusajs/framework/zod';

export const MAX_PRODUCT_IDS = 100;

export const StoreGetWarehouseAvailabilityParams = z.object({
  warehouse_id: z.string().min(1).max(100),
  // Comma-separated, as the storefront sends it.
  product_ids: z
    .string()
    .min(1)
    .transform((value) => value.split(',').map((id) => id.trim()).filter(Boolean))
    .pipe(z.array(z.string()).min(1).max(MAX_PRODUCT_IDS)),
});

export type StoreGetWarehouseAvailabilityParams = z.infer<
  typeof StoreGetWarehouseAvailabilityParams
>;

export const warehouseAvailabilityMiddlewares: MiddlewareRoute[] = [
  {
    method: ['GET'],
    matcher: '/store/warehouse-availability',
    middlewares: [
      authenticate('customer', ['session', 'bearer'], {
        allowUnauthenticated: true,
      }),
      validateAndTransformQuery(StoreGetWarehouseAvailabilityParams, {}),
    ],
  },
];
