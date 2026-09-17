import { createCartWorkflow } from '@medusajs/medusa/core-flows';
import { assertMinimumQuantity } from './utils/assert-minimum-quantity';

/**
 * A cart can be created with line items already in it, which goes through this
 * workflow rather than `addToCartWorkflow`. Without this hook a below-minimum
 * line could sit in a cart until checkout, where `completeCartWorkflow` would
 * finally reject it.
 *
 * The cart does not exist yet, so the payload's quantities are the resulting
 * quantities - there is nothing to merge with.
 */
createCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  const quantities = new Map<string, number>();

  for (const item of cart?.items ?? []) {
    if (!item?.variant_id) {
      continue;
    }

    quantities.set(
      item.variant_id,
      (quantities.get(item.variant_id) ?? 0) + Number(item.quantity),
    );
  }

  await assertMinimumQuantity(container, quantities);
});
