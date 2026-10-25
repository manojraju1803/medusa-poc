import {
  MiddlewareRoute,
  authenticate,
  validateAndTransformBody,
  validateAndTransformQuery,
} from '@medusajs/framework/http';
import { z } from '@medusajs/framework/zod';

// Out-of-range coordinates are not rejected here: the resolver treats them as
// absent and answers with the default warehouse.
const coordinate = z.number().finite();

export const StorePostLocation = z.object({
  // A buyer's explicit pick wins over coordinates.
  warehouse_id: z.string().min(1).max(100).optional(),
  lat: coordinate.nullish(),
  lng: coordinate.nullish(),
});

export type StorePostLocation = z.infer<typeof StorePostLocation>;

export const StoreGetLocationParams = z.object({
  lat: z.coerce.number().finite().optional(),
  lng: z.coerce.number().finite().optional(),
});

export type StoreGetLocationParams = z.infer<typeof StoreGetLocationParams>;

const auth = authenticate('customer', ['session', 'bearer'], {
  allowUnauthenticated: true,
});

export const locationMiddlewares: MiddlewareRoute[] = [
  {
    method: ['GET'],
    matcher: '/store/location',
    middlewares: [auth, validateAndTransformQuery(StoreGetLocationParams, {})],
  },
  {
    method: ['POST'],
    matcher: '/store/location',
    middlewares: [auth, validateAndTransformBody(StorePostLocation)],
  },
];
