import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { APPROVED_GROUP } from '../api/utils/is-approved';
import { setCustomerApprovalWorkflow } from '../workflows/set-customer-approval';

/**
 * Puts each new sign-up in the Unapproved group, so the admin can find the
 * customers waiting for approval.
 *
 * Runs after the sign-up has finished, so a problem here (such as the group
 * not existing yet) is logged and never stops anyone signing up.
 */
export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: customers } = await query.graph({
    entity: 'customer',
    fields: ['id', 'has_account', 'groups.name'],
    filters: { id: data.id },
  });
  const customer = customers[0];

  // Customers added in the admin have no account and can't log in, so there
  // is nothing to approve.
  if (!customer?.has_account) {
    return;
  }
  // Never take approval away from someone who already has it.
  if ((customer.groups ?? []).some((group) => group?.name === APPROVED_GROUP)) {
    return;
  }

  await setCustomerApprovalWorkflow(container).run({
    input: { customer_id: customer.id, approved: false },
  });
}

export const config: SubscriberConfig = {
  event: 'customer.created',
};
