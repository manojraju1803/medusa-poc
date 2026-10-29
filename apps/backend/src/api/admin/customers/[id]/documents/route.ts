import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { updateCustomerDocumentsWorkflow } from '../../../../../workflows/update-customer-documents';
import { AdminPostCustomerDocument } from './middlewares';

// Uploads or replaces one of a supplier's quality documents from the admin.
export async function POST(
  req: MedusaRequest<AdminPostCustomerDocument>,
  res: MedusaResponse,
) {
  const { result } = await updateCustomerDocumentsWorkflow(req.scope).run({
    input: {
      customerId: req.params.id,
      files: [req.validatedBody],
      remove: [],
    },
  });
  res.json({ documents: result });
}
