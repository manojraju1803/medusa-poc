import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { setCustomerApprovalWorkflow } from '../../../../../workflows/set-customer-approval';
import { AdminPostCustomerApproval } from '../../../demo-middlewares';

export async function POST(
  req: MedusaRequest<AdminPostCustomerApproval>,
  res: MedusaResponse,
) {
  const { id } = req.params;
  const { approved } = req.validatedBody;

  await setCustomerApprovalWorkflow(req.scope).run({
    input: { customer_id: id, approved },
  });

  res.json({ customer: { id, approved } });
}
