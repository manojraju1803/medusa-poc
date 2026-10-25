import {
  authenticate,
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaResponse,
  MiddlewareRoute,
} from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

// Customer metadata keys only the platform may set. Medusa's stock
// `POST /store/customers/me` lets a customer replace their whole `metadata`
// (the wishlist relies on that), so without this a buyer could rewrite
// `account_type` and be moved into another customer group.
// `documents` changes only through `POST /store/customers/me/documents`.
export const PROTECTED_METADATA_KEYS = [
  'account_type',
  'terms_accepted_at',
  'documents',
] as const;

type MetadataBody = { metadata?: Record<string, unknown> | null };

const keepProtected = (
  incoming: Record<string, unknown> | null | undefined,
  current: Record<string, unknown>,
) => {
  const next: Record<string, unknown> = { ...(incoming ?? {}) };
  for (const key of PROTECTED_METADATA_KEYS) {
    if (key in current) next[key] = current[key];
    else delete next[key];
  }
  return next;
};

async function protectCustomerMetadata(
  req: AuthenticatedMedusaRequest,
  _res: MedusaResponse,
  next: MedusaNextFunction,
) {
  const body = req.body as MetadataBody | undefined;
  const validated = req.validatedBody as MetadataBody | undefined;
  const touchesMetadata =
    (body && 'metadata' in body) || (validated && 'metadata' in validated);
  const customerId = req.auth_context?.actor_id;
  if (!touchesMetadata || !customerId) return next();

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [customer],
  } = await query.graph({
    entity: 'customer',
    fields: ['metadata'],
    filters: { id: customerId },
  });
  const current = (customer?.metadata ?? {}) as Record<string, unknown>;

  // Patch both: depending on order, the stock body validator may already have
  // copied the body into `validatedBody`.
  if (body && 'metadata' in body) body.metadata = keepProtected(body.metadata, current);
  if (validated && 'metadata' in validated) {
    validated.metadata = keepProtected(validated.metadata, current);
  }
  next();
}

export const protectMetadataMiddlewares: MiddlewareRoute[] = [
  {
    method: ['POST'],
    matcher: '/store/customers/me',
    middlewares: [
      authenticate('customer', ['session', 'bearer']),
      protectCustomerMetadata,
    ],
  },
];
