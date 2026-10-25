import {
  AuthenticatedMedusaRequest,
  MedusaRequest,
} from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

export const APPROVED_GROUP = 'Approved';

// Where sign-ups wait for approval, so the admin can find them. Only a label:
// prices and carts depend on the Approved group alone.
export const UNAPPROVED_GROUP = 'Unapproved';

/**
 * Whether the requesting customer may see prices: logged in, and a member of
 * the `Approved` customer group.
 */
export async function isApproved(req: MedusaRequest): Promise<boolean> {
  // Store routes authenticate with `allowUnauthenticated`, so `auth_context` is
  // absent for logged-out callers. The base `MedusaRequest` does not declare it.
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
