import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { isApproved } from '../../utils/is-approved';
import { StoreGetStockLevelsParams } from './middlewares';

// Per-warehouse stock for one variant. Stock is shown to approved buyers only,
// like prices.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  if (!(await isApproved(req))) {
    return res.status(403).json({ message: 'Stock is shown to approved buyers only' });
  }

  const { variant_id } = req.validatedQuery as StoreGetStockLevelsParams;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: variants } = await query.graph({
    entity: 'product_variant',
    fields: ['id', 'inventory_items.inventory_item_id'],
    filters: { id: variant_id },
  });
  const itemIds = (variants[0]?.inventory_items ?? [])
    .map((i) => i?.inventory_item_id)
    .filter((id): id is string => !!id);
  if (!itemIds.length) {
    return res.json({ levels: [] });
  }

  const { data: levels } = await query.graph({
    entity: 'inventory_level',
    fields: ['location_id', 'stocked_quantity', 'reserved_quantity'],
    filters: { inventory_item_id: itemIds },
  });
  const { data: locations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name', 'address.city'],
    filters: { id: levels.map((l) => l.location_id) },
  });
  const byId = new Map(locations.map((l) => [l.id, l]));

  res.json({
    levels: levels
      .map((l) => {
        const loc = byId.get(l.location_id);
        return {
          location_id: l.location_id,
          name: loc?.name ?? '',
          city: loc?.address?.city ?? '',
          stocked_quantity: Number(l.stocked_quantity) - Number(l.reserved_quantity ?? 0),
        };
      })
      .filter((l) => l.city),
  });
}
