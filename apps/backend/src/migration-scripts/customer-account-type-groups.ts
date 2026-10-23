import { ExecArgs } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { syncAccountTypeGroupsWorkflow } from '../workflows/sync-account-type-groups';

// Creates the Buyer, R&D and Supplier customer groups and files every existing
// customer under the one matching `metadata.account_type` (customers with none
// are buyers). Safe to re-run; new customers are handled by the
// `customer-account-type-group` subscriber.
export default async function customerAccountTypeGroups({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const { result } = await syncAccountTypeGroupsWorkflow(container).run({
    input: {},
  });
  logger.info(
    `Account type groups: ${result.checked} customers checked, ${result.added} added, ${result.removed} moved out of the wrong group.`,
  );
}
