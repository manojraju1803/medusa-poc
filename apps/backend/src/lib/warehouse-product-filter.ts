import type {
  MedusaNextFunction,
  MedusaResponse,
  MedusaStoreRequest,
} from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

import { listWarehouses, productIdsAt } from './warehouses';

/**
 * Header carrying the warehouse to narrow a product listing to.
 *
 * A header rather than a query parameter because Medusa validates store query
 * params against a fixed schema and rejects anything unrecognised with
 * "Unrecognized fields". That schema is a zod pipe with no extension point, so
 * a header is the honest way in without rebuilding core validation.
 */
export const WAREHOUSE_HEADER = 'x-warehouse-id';

/**
 * No product carries this id, so using it as the `id` filter yields an empty
 * page. An empty array is not a dependable way to say "match nothing".
 */
const MATCHES_NOTHING = '__no_product_at_this_warehouse__';

/**
 * Restricts a product listing to what one warehouse carries.
 *
 * Runs on `/store/products` itself rather than on a route of its own, so the
 * `hidePrices` middleware alongside it keeps applying. A separate endpoint
 * would not match that matcher, and unapproved customers would then see prices.
 */
export async function filterProductsByWarehouse(
  req: MedusaStoreRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  const header = req.headers[WAREHOUSE_HEADER];
  const warehouseId = Array.isArray(header) ? header[0] : header;

  const fields = req.filterableFields as Record<string, unknown> | undefined;

  if (!warehouseId || !fields) {
    return next();
  }

  try {
    const warehouses = await listWarehouses(
      req.scope,
      req.publishable_key_context.sales_channel_ids,
    );

    // An id that is not a known warehouse is ignored rather than rejected: a
    // stale cookie or bookmark should show the full catalogue, not an error.
    if (!warehouses.some((warehouse) => warehouse.id === warehouseId)) {
      return next();
    }

    fields.id = intersectIds(
      fields.id,
      await productIdsAt(req.scope, warehouseId),
    );
  } catch (error) {
    // Filtering is an enhancement. If the lookup fails the buyer should get the
    // unfiltered catalogue rather than an error page.
    req.scope
      .resolve(ContainerRegistrationKeys.LOGGER)
      .error('Warehouse product filter failed, serving unfiltered: ' + String(error));
  }

  next();
}

/**
 * Combines the warehouse's product ids with any id filter already present.
 *
 * Category and collection pages arrive with their own `id` list, so replacing
 * it would widen those pages to the whole catalogue.
 */
export function intersectIds(existing: unknown, stocked: string[]): string[] {
  if (!stocked.length) {
    return [MATCHES_NOTHING];
  }

  const existingIds = toIdArray(existing);

  if (!existingIds) {
    return stocked;
  }

  const allowed = new Set(stocked);
  const intersection = existingIds.filter((id) => allowed.has(id));

  return intersection.length ? intersection : [MATCHES_NOTHING];
}

function toIdArray(value: unknown): string[] | null {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value) && value.every((id) => typeof id === 'string')) {
    return value as string[];
  }

  return null;
}
