import { authenticate, MiddlewareRoute } from '@medusajs/framework/http';

export const customerDocumentDownloadMiddlewares: MiddlewareRoute[] = [
  {
    method: ['GET'],
    matcher: '/store/customers/:id/documents/:type',
    // Logged-out callers get 401 here.
    middlewares: [authenticate('customer', ['session', 'bearer'])],
  },
];
