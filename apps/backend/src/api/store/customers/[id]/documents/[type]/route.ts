import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from '@medusajs/framework/http';
import { MedusaError } from '@medusajs/framework/utils';
import { documentDownloadUrl } from '../../../../../utils/document-download';

// Opens one of a customer's own documents: redirects to a link that works for
// 5 minutes. `:id` may be "me". Anyone but the customer gets 401, as the task
// asks; admins use GET /admin/customers/:id/documents/:type.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const actorId = req.auth_context.actor_id;
  const customerId = req.params.id === 'me' ? actorId : req.params.id;
  if (!actorId || customerId !== actorId) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      'You can only open your own documents.',
    );
  }

  const url = await documentDownloadUrl(req.scope, customerId, req.params.type);
  res.setHeader('Cache-Control', 'no-store');
  res.redirect(url);
}
