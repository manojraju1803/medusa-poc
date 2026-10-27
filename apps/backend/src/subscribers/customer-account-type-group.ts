import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import { syncAccountTypeGroupsWorkflow } from '../workflows/sync-account-type-groups';

// Storefront registrations (and admin-created customers) land in the Buyer,
// R&D or Supplier customer group for the account type they chose. Re-runs on
// update so an account type edited in the admin moves the customer too.
export default async function customerAccountTypeGroupHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await syncAccountTypeGroupsWorkflow(container).run({
    input: { customerIds: [data.id] },
  });
}

export const config: SubscriberConfig = {
  event: ['customer.created', 'customer.updated'],
};
