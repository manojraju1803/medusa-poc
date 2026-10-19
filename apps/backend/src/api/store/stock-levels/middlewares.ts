import {
  MiddlewareRoute,
  authenticate,
  validateAndTransformQuery,
} from '@medusajs/framework/http';
import { z } from '@medusajs/framework/zod';

export const StoreGetStockLevelsParams = z.object({
  variant_id: z.string().min(1),
});

export type StoreGetStockLevelsParams = z.infer<typeof StoreGetStockLevelsParams>;

export const stockLevelMiddlewares: MiddlewareRoute[] = [
  {
    method: ['GET'],
    matcher: '/store/stock-levels',
    middlewares: [
      authenticate('customer', ['session', 'bearer'], {
        allowUnauthenticated: true,
      }),
      validateAndTransformQuery(StoreGetStockLevelsParams, {}),
    ],
  },
];
