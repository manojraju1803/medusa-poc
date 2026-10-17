import {
  MiddlewareRoute,
  authenticate,
  validateAndTransformBody,
} from '@medusajs/framework/http';
import { z } from '@medusajs/framework/zod';

export const StorePostInquiry = z.object({
  type: z.enum(['quote_sample', 'contact', 'supplier_registration']),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(50).optional(),
  company: z.string().trim().max(200).optional(),
  message: z.string().trim().max(5000).optional(),
  product_id: z.string().max(100).optional(),
  variant_id: z.string().max(100).optional(),
  quantity: z.number().positive().max(1_000_000).optional(),
  unit: z.string().max(20).optional(),
  wants_quote: z.boolean().optional(),
  wants_sample: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type StorePostInquiry = z.infer<typeof StorePostInquiry>;

export const inquiryMiddlewares: MiddlewareRoute[] = [
  {
    method: ['POST'],
    matcher: '/store/inquiries',
    middlewares: [
      // Guests can send inquiries; a logged-in customer gets linked.
      authenticate('customer', ['session', 'bearer'], {
        allowUnauthenticated: true,
      }),
      validateAndTransformBody(StorePostInquiry),
    ],
  },
];
