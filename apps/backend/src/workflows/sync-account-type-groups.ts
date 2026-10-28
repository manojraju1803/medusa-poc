import { ICustomerModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';

// One customer group per account type chosen at registration. Groups are found
// by `metadata.ib_account_type`, so renaming them in the admin is safe.
export const ACCOUNT_TYPE_GROUPS = {
  buyer: 'Buyer',
  rnd: 'R&D',
  supplier: 'Supplier',
} as const;

export type AccountType = keyof typeof ACCOUNT_TYPE_GROUPS;

const GROUP_KEY = 'ib_account_type';

// Customers created before account types existed carry none: they're buyers.
export const accountTypeOf = (metadata: unknown): AccountType => {
  const value = (metadata as Record<string, unknown> | null)?.account_type;
  return typeof value === 'string' && value in ACCOUNT_TYPE_GROUPS
    ? (value as AccountType)
    : 'buyer';
};

const ensureAccountTypeGroupsStep = createStep(
  'ensure-account-type-groups',
  async (_: undefined, { container }) => {
    const customerService: ICustomerModuleService = container.resolve(
      Modules.CUSTOMER,
    );
    const existing = await customerService.listCustomerGroups(
      {},
      { select: ['id', 'name', 'metadata'], take: 500 },
    );

    const groupIds = {} as Record<AccountType, string>;
    const created: string[] = [];
    for (const type of Object.keys(ACCOUNT_TYPE_GROUPS) as AccountType[]) {
      const found = existing.find((g) => g.metadata?.[GROUP_KEY] === type);
      if (found) {
        groupIds[type] = found.id;
        continue;
      }
      const group = await customerService.createCustomerGroups({
        name: ACCOUNT_TYPE_GROUPS[type],
        metadata: { [GROUP_KEY]: type },
      });
      groupIds[type] = group.id;
      created.push(group.id);
    }

    return new StepResponse(groupIds, created);
  },
  async (created, { container }) => {
    if (!created?.length) return;
    const customerService: ICustomerModuleService = container.resolve(
      Modules.CUSTOMER,
    );
    await customerService.deleteCustomerGroups(created);
  },
);

type Membership = { customer_id: string; customer_group_id: string };

const syncMembershipsStep = createStep(
  'sync-memberships',
  async (
    input: { customerIds?: string[]; groupIds: Record<AccountType, string> },
    { container },
  ) => {
    const customerService: ICustomerModuleService = container.resolve(
      Modules.CUSTOMER,
    );
    const customers = await customerService.listCustomers(
      input.customerIds ? { id: input.customerIds } : {},
      { select: ['id', 'metadata'], relations: ['groups'], take: 10000 },
    );

    const typeGroupIds = new Set(Object.values(input.groupIds));
    const added: Membership[] = [];
    const removed: Membership[] = [];

    for (const customer of customers) {
      const wanted = input.groupIds[accountTypeOf(customer.metadata)];
      const current = new Set((customer.groups ?? []).map((g) => g.id));
      if (!current.has(wanted)) {
        added.push({ customer_id: customer.id, customer_group_id: wanted });
      }
      for (const groupId of current) {
        if (groupId !== wanted && typeGroupIds.has(groupId)) {
          removed.push({ customer_id: customer.id, customer_group_id: groupId });
        }
      }
    }

    if (added.length) await customerService.addCustomerToGroup(added);
    if (removed.length) await customerService.removeCustomerFromGroup(removed);

    return new StepResponse(
      { checked: customers.length, added: added.length, removed: removed.length },
      { added, removed },
    );
  },
  async (changes, { container }) => {
    if (!changes) return;
    const customerService: ICustomerModuleService = container.resolve(
      Modules.CUSTOMER,
    );
    if (changes.added.length) {
      await customerService.removeCustomerFromGroup(changes.added);
    }
    if (changes.removed.length) {
      await customerService.addCustomerToGroup(changes.removed);
    }
  },
);

// Puts each customer in the Buyer, R&D or Supplier group that matches
// `metadata.account_type`, and out of the other two. Omit `customerIds` to
// sync every customer.
export const syncAccountTypeGroupsWorkflow = createWorkflow(
  'sync-account-type-groups',
  (input: { customerIds?: string[] }) => {
    const groupIds = ensureAccountTypeGroupsStep();
    const result = syncMembershipsStep({
      customerIds: input.customerIds,
      groupIds,
    });
    return new WorkflowResponse(result);
  },
);
