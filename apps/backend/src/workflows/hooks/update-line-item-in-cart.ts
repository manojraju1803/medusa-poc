import { updateLineItemInCartWorkflow } from '@medusajs/medusa/core-flows';
import { assertMinimumQuantity } from './utils/assert-minimum-quantity';

/**
 * The update carries an absolute quantity, so it is the resulting quantity.
 */
updateLineItemInCartWorkflow.hooks.validate(
  async ({ input, cart }, { container }) => {
    const quantity = input.update?.quantity;

    // This workflow also updates other fields; don't block those.
    if (quantity === undefined) {
      return;
    }

    const item = cart.items?.find((cartItem) => cartItem.id === input.item_id);

    if (!item?.variant_id) {
      return;
    }

    await assertMinimumQuantity(
      container,
      new Map([[item.variant_id, Number(quantity)]]),
    );
  },
);
