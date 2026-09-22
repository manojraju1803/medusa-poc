import {
  defineMiddlewares,
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { MedusaError } from '@medusajs/framework/utils';

async function requireApproved(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  if (await isApproved(req)) {
    return next();
  }
  next(
    new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      'Your account must be approved before you can use a cart.',
    ),
  );
}

const APPROVED_GROUP = 'Approved';

async function isApproved(req: MedusaRequest): Promise<boolean> {
  // Store routes authenticate with `allowUnauthenticated`, so `auth_context` is
  // absent for logged-out callers. The middleware array is typed against the base
  // `MedusaRequest`, which does not declare it.
  const actorId = (req as AuthenticatedMedusaRequest).auth_context?.actor_id;
  if (!actorId) {
    return false;
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: 'customer',
    fields: ['id', 'groups.name'],
    filters: { id: actorId },
  });

  return !!data[0]?.groups?.some((group) => group?.name === APPROVED_GROUP);
}

async function hidePrices(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  if (await isApproved(req)) {
    return next();
  }

  if (req.queryConfig?.fields) {
    req.queryConfig.fields = req.queryConfig.fields.filter(
      (field) => !field.includes('calculated_price'),
    );
  }

  next();
}

export default defineMiddlewares({
  routes: [
    {
      method: ['GET'],
      matcher: '/store/products',
      middlewares: [hidePrices],
    },
    {
      method: ['GET'],
      matcher: '/store/products/:id',
      middlewares: [hidePrices],
    },
    {
      method: ['GET'],
      matcher: '/store/product-variants',
      middlewares: [hidePrices],
    },
    {
      method: ['GET'],
      matcher: '/store/product-variants/:id',
      middlewares: [hidePrices],
    },
    {
      method: ['GET'],
      matcher: '/store/product-categories',
      middlewares: [hidePrices],
    },
    {
      method: ['GET'],
      matcher: '/store/product-categories/:id',
      middlewares: [hidePrices],
    },
    {
      method: ['GET'],
      matcher: '/store/collections',
      middlewares: [hidePrices],
    },
    {
      method: ['GET'],
      matcher: '/store/collections/:id',
      middlewares: [hidePrices],
    },
    {
      method: ['POST'],
      matcher: '/store/carts',
      middlewares: [requireApproved],
    },
    {
      method: ['POST'],
      matcher: '/store/carts/:id/line-items',
      middlewares: [requireApproved],
    },
    {
      method: ['GET', 'POST'],
      matcher: '/store/carts/:id',
      middlewares: [requireApproved],
    },
    {
      method: ['POST', 'DELETE'],
      matcher: '/store/carts/:id/line-items/:line_id',
      middlewares: [requireApproved],
    },
    {
      method: ['POST'],
      matcher: '/store/carts/:id/complete',
      middlewares: [requireApproved],
    },
  ],
});
