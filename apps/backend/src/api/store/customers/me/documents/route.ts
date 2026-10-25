import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from '@medusajs/framework/http';
import { updateCustomerDocumentsWorkflow } from '../../../../../workflows/update-customer-documents';
import { StorePostMyDocuments } from './middlewares';

// Lets a signed-in supplier add, replace (same label) or remove the quality
// documents shown on their profile.
export async function POST(
  req: AuthenticatedMedusaRequest<StorePostMyDocuments>,
  res: MedusaResponse,
) {
  const { result } = await updateCustomerDocumentsWorkflow(req.scope).run({
    input: {
      customerId: req.auth_context.actor_id,
      files: req.validatedBody.files,
      remove: req.validatedBody.remove,
    },
  });

  res.json({ documents: result });
}
