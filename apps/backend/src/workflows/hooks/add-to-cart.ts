import { addToCartWorkflow } from '@medusajs/medusa/core-flows';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { assertMinimumQuantity } from './utils/assert-minimum-quantity';

/**
 * Medusa merges an added item into an existing line for the same variant, so the
 * minimum is checked against the quantity the line will end up at, not the delta.
 *
 * The `cart` this hook receives is fetched with `cartFieldsForPricingContext`,
 * which carries no line items, so they are queried here instead.
 */
addToCartWorkflow.hooks.validate(async ({ input }, { container }) => {
  const incoming = input.items ?? [];

  if (!incoming.length) {
    return;
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: carts } = await query.graph({
    entity: 'cart',
    fields: ['id', 'items.variant_id', 'items.quantity'],
    filters: { id: input.cart_id },
  });

  const existing = new Map<string, number>();

  for (const item of carts[0]?.items ?? []) {
    if (!item?.variant_id) {
      continue;
    }

    existing.set(
      item.variant_id,
      (existing.get(item.variant_id) ?? 0) + Number(item.quantity),
    );
  }

  // Only variants this request touches, so an unrelated line already below its
  // minimum doesn't block the add.
  const quantities = new Map<string, number>();

  for (const item of incoming) {
    if (!item.variant_id) {
      continue;
    }

    const base =
      quantities.get(item.variant_id) ?? existing.get(item.variant_id) ?? 0;

    quantities.set(item.variant_id, base + Number(item.quantity));
  }

  await assertMinimumQuantity(container, quantities);
});
