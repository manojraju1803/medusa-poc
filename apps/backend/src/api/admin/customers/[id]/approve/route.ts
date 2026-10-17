import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { linkCustomersToCustomerGroupWorkflow } from '@medusajs/medusa/core-flows';

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const { approved } = req.body as { approved: boolean };

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
