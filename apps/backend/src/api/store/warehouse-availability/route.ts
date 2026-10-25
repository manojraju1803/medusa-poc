import type { MedusaResponse, MedusaStoreRequest } from '@medusajs/framework/http';
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils';

import { availableQuantity, listWarehouses } from '../../../lib/warehouses';
import { isApproved } from '../../utils/is-approved';
import type { StoreGetWarehouseAvailabilityParams } from './middlewares';

/**
 * Availability of a product at one warehouse.
 *
 * `stocked_here` distinguishes "this warehouse does not carry the item" from
 * "it carries it but has none right now" - the storefront presents those
 * differently, so they must not be collapsed into one flag.
 */
export type WarehouseAvailability = {
  stocked_here: boolean;
  in_stock: boolean;
};

/**
 * Reports, per product, whether a given warehouse can currently supply it.
 *
 * Booleans rather than quantities, and approved buyers only: stock is gated
 * like prices (see `stock-levels`).
 */
export const GET = async (
  req: MedusaStoreRequest<unknown, StoreGetWarehouseAvailabilityParams>,
  res: MedusaResponse,
) => {
  if (!(await isApproved(req))) {
    return res.status(403).json({ message: 'Stock is shown to approved buyers only' });
  }

  const { warehouse_id: warehouseId, product_ids: productIds } =
    req.validatedQuery as StoreGetWarehouseAvailabilityParams;

  const warehouses = await listWarehouses(
    req.scope,
    req.publishable_key_context.sales_channel_ids,
  );

  if (!warehouses.some((warehouse) => warehouse.id === warehouseId)) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Warehouse ${warehouseId} is not available.`,
    );
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: products } = await query.graph({
    entity: 'product',
    fields: [
      'id',
      'variants.inventory_items.inventory.location_levels.location_id',
      'variants.inventory_items.inventory.location_levels.stocked_quantity',
      'variants.inventory_items.inventory.location_levels.reserved_quantity',
    ],
    filters: { id: productIds },
  });

  const availability: Record<string, WarehouseAvailability> = {};

  for (const product of products) {
    let stockedHere = false;
    let inStock = false;

    for (const variant of product.variants ?? []) {
      for (const link of variant?.inventory_items ?? []) {
        for (const level of link?.inventory?.location_levels ?? []) {
          if (level?.location_id !== warehouseId) {
            continue;
          }

          stockedHere = true;

          if (availableQuantity(level) > 0) {
            inStock = true;
          }
        }
      }
    }

    availability[product.id] = { stocked_here: stockedHere, in_stock: inStock };
  }

  res.json({ warehouse_id: warehouseId, availability });
};
