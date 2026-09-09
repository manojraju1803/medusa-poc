import {
  defineMiddlewares,
  AuthenticatedMedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { MedusaError } from '@medusajs/framework/utils';

async function requireApproved(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  if (await isApproved(req)) {
    return next();
  }
  next(
    new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      'Your account must be approved before adding items to a cart.',
    ),
  );
}

const APPROVED_GROUP = 'Approved';

async function isApproved(req: AuthenticatedMedusaRequest): Promise<boolean> {
  const actorId = req.auth_context?.actor_id;
  if (!actorId) {
    return false;
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: 'customer',
    fields: ['id', 'groups.name'],
    filters: { id: actorId },
  });

  return !!data[0]?.groups?.some((g) => g.name === APPROVED_GROUP);
}

async function hidePrices(
  req: AuthenticatedMedusaRequest,
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
      method: ['POST'],
      matcher: '/store/carts',
      middlewares: [requireApproved],
    },
    {
      method: ['POST'],
      matcher: '/store/carts/:id/line-items',
      middlewares: [requireApproved],
    },
  ],
});
