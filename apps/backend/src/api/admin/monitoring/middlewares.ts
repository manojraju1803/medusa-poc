import {
  MiddlewareRoute,
  validateAndTransformQuery,
} from '@medusajs/framework/http';
import { z } from '@medusajs/framework/zod';
import { TREND_RANGES } from '../../utils/monitoring';

export const AdminGetTrendsParams = z.object({
  range: z.enum(TREND_RANGES).default('30d'),
});
export type AdminGetTrendsParams = z.infer<typeof AdminGetTrendsParams>;

export const AdminGetLowStockParams = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type AdminGetLowStockParams = z.infer<typeof AdminGetLowStockParams>;

export const monitoringMiddlewares: MiddlewareRoute[] = [
  {
    method: ['GET'],
    matcher: '/admin/monitoring/trends',
    middlewares: [validateAndTransformQuery(AdminGetTrendsParams, {})],
  },
  {
    method: ['GET'],
    matcher: '/admin/monitoring/low-stock',
    middlewares: [validateAndTransformQuery(AdminGetLowStockParams, {})],
  },
];
