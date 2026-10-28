import {
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
  MiddlewareRoute,
  authenticate,
} from '@medusajs/framework/http';
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils';
import { verifyInvoiceToken } from '../../../lib/invoice-token';
import { INVOICE_TOKEN_HEADER, invoiceTokenSecret } from '../../utils/invoice-access';

/**
 * Medusa serves any order by id to anyone. Here an order is served only to
 * the customer who placed it, or to a storefront request carrying an invoice
 * token from the admin. Anyone else gets the same 404 as a missing order.
 */
async function requireOrderOwner(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  const { id } = req.params;

  const token = req.get(INVOICE_TOKEN_HEADER);
  if (token && verifyInvoiceToken(id, token, invoiceTokenSecret(req))) {
    return next();
  }

  const actorId = (req as AuthenticatedMedusaRequest).auth_context?.actor_id;
  if (actorId) {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const { data } = await query.graph({
      entity: 'order',
      fields: ['customer_id'],
      filters: { id },
    });
    if (data[0]?.customer_id === actorId) {
      return next();
    }
  }

  next(
    new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Order with id: ${id} was not found`,
    ),
  );
}

export const orderAccessMiddlewares: MiddlewareRoute[] = [
  {
    method: ['GET'],
    matcher: '/store/orders/:id',
    middlewares: [
      authenticate('customer', ['session', 'bearer'], {
        allowUnauthenticated: true,
      }),
      requireOrderOwner,
    ],
  },
];
