import { completeCartWorkflow } from '@medusajs/medusa/core-flows';
import { assertMinimumQuantity } from './utils/assert-minimum-quantity';

/**
 * Final gate before the order exists. Catches carts that were valid when built
 * but no longer are, such as when a minimum is raised afterwards.
 *
 * Only throws. The order is built from a cart snapshot taken before this hook
 * runs, so mutating `cart` here would be silently discarded.
 */
completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  const quantities = new Map<string, number>();

  for (const item of cart.items ?? []) {
    if (!item.variant_id) {
      continue;
    }

    quantities.set(
      item.variant_id,
      (quantities.get(item.variant_id) ?? 0) + Number(item.quantity),
    );
  }

  await assertMinimumQuantity(container, quantities);
});
