import {
  MiddlewareRoute,
  validateAndTransformBody,
} from '@medusajs/framework/http';
import { z } from '@medusajs/framework/zod';

export const AdminPostCustomerApproval = z.object({ approved: z.boolean() });
export type AdminPostCustomerApproval = z.infer<typeof AdminPostCustomerApproval>;

export const AdminPostInquiryStatus = z.object({
  status: z.enum(['new', 'in_progress', 'closed']),
});
export type AdminPostInquiryStatus = z.infer<typeof AdminPostInquiryStatus>;

export const adminDemoMiddlewares: MiddlewareRoute[] = [
  {
    method: ['POST'],
    matcher: '/admin/customers/:id/approve',
    middlewares: [validateAndTransformBody(AdminPostCustomerApproval)],
  },
  {
    method: ['POST'],
    matcher: '/admin/inquiries/:id',
    middlewares: [validateAndTransformBody(AdminPostInquiryStatus)],
  },
];
