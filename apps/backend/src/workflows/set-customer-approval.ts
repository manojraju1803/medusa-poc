import {
  createWorkflow,
  WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import { linkCustomerGroupsToCustomerStep } from '@medusajs/medusa/core-flows';
import {
  ApprovalGroupChangesInput,
  approvalGroupChangesStep,
} from './steps/approval-group-changes';

/**
 * Approves a customer (moves them into Approved, out of Unapproved) or takes
 * approval away (the other way round). Used by the admin's IB Approval button
 * and for new sign-ups.
 */
export const setCustomerApprovalWorkflow = createWorkflow(
  'set-customer-approval',
  function (input: ApprovalGroupChangesInput) {
    const changes = approvalGroupChangesStep(input);
    linkCustomerGroupsToCustomerStep(changes);
    return new WorkflowResponse(changes);
  },
);
