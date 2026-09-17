import { MedusaContainer } from '@medusajs/framework/types';
import {
  ContainerRegistrationKeys,
  MedusaError,
} from '@medusajs/framework/utils';

export const MIN_QUANTITY_KEY = 'min_quantity';

/**
 * Throws when any variant would end up below the minimum order quantity
 * declared in its metadata.
 *
 * @param quantities variant id mapped to the quantity it would end up at
 */
export async function assertMinimumQuantity(
  container: MedusaContainer,
  quantities: Map<string, number>,
): Promise<void> {
  if (!quantities.size) {
    return;
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: variants } = await query.graph({
    entity: 'product_variant',
    fields: ['id', 'title', 'metadata'],
    filters: { id: [...quantities.keys()] },
  });

  for (const variant of variants) {
    // metadata is free-form JSONB, so the value may be a number or a string
    const minimum = Number(variant.metadata?.[MIN_QUANTITY_KEY] ?? 0);

    if (!Number.isFinite(minimum) || minimum <= 0) {
      continue;
    }

    const quantity = quantities.get(variant.id) ?? 0;

    if (quantity < minimum) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `"${variant.title}" has a minimum order quantity of ${minimum}. You requested ${quantity}.`,
      );
    }
  }
}
