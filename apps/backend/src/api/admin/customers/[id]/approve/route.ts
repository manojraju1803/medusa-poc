import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { linkCustomersToCustomerGroupWorkflow } from '@medusajs/medusa/core-flows';
import { AdminPostCustomerApproval } from '../../../demo-middlewares';

export async function POST(
  req: MedusaRequest<AdminPostCustomerApproval>,
  res: MedusaResponse,
) {
  const { id } = req.params;
  const { approved } = req.validatedBody;

  if (typeof approved !== 'boolean') {
    return res.status(400).json({ message: '`approved` must be a boolean' });
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: groups } = await query.graph({
    entity: 'customer_group',
    fields: ['id', 'name'],
    filters: { name: 'Approved' },
  });

  if (!groups[0]) {
    return res.status(404).json({ message: '"Approved" customer group not found' });
  }

  await linkCustomersToCustomerGroupWorkflow(req.scope).run({
    input: {
      id: groups[0].id,
      add: approved ? [id] : [],
      remove: approved ? [] : [id],
    },
  });

  res.json({ customer: { id, approved } });
}
