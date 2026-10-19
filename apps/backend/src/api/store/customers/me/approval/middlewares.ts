import { MiddlewareRoute, authenticate } from '@medusajs/framework/http';

export const approvalMiddlewares: MiddlewareRoute[] = [
  {
    method: ['GET'],
    matcher: '/store/customers/me/approval',
    middlewares: [authenticate('customer', ['session', 'bearer'])],
  },
];
