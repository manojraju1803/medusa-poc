import {
  ContainerRegistrationKeys,
  MedusaError,
} from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { APPROVED_GROUP, UNAPPROVED_GROUP } from '../../api/utils/is-approved';

export type ApprovalGroupChangesInput = {
  customer_id: string;
  approved: boolean;
};

/**
 * Which groups a customer joins and leaves to become approved (in Approved,
 * out of Unapproved) or not approved (the other way round). Only adds a group
 * the customer isn't in: Medusa would record a second membership otherwise.
 *
 * Reads only, so there is nothing to undo.
 */
export const approvalGroupChangesStep = createStep(
  'approval-group-changes',
  async ({ customer_id, approved }: ApprovalGroupChangesInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: groups } = await query.graph({
      entity: 'customer_group',
      fields: ['id', 'name'],
      filters: { name: [APPROVED_GROUP, UNAPPROVED_GROUP] },
    });
    const approvedGroup = groups.find((group) => group.name === APPROVED_GROUP);
    const unapprovedGroup = groups.find((group) => group.name === UNAPPROVED_GROUP);
    if (!approvedGroup) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `"${APPROVED_GROUP}" customer group not found`,
      );
    }
    if (!approved && !unapprovedGroup) {
      // The admin creates this group by hand; until then, approval still works.
      container
        .resolve(ContainerRegistrationKeys.LOGGER)
        .warn(`No "${UNAPPROVED_GROUP}" customer group, so ${customer_id} isn't labelled.`);
    }

    const { data: customers } = await query.graph({
      entity: 'customer',
      fields: ['id', 'groups.id'],
      filters: { id: customer_id },
    });
    if (!customers[0]) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Customer ${customer_id} not found`,
      );
    }
    const current = new Set((customers[0].groups ?? []).map((group) => group?.id));

    const join = approved ? approvedGroup : unapprovedGroup;
    const leave = approved ? unapprovedGroup : approvedGroup;

    return new StepResponse({
      id: customer_id,
      add: join && !current.has(join.id) ? [join.id] : [],
      remove: leave && current.has(leave.id) ? [leave.id] : [],
    });
  },
);
