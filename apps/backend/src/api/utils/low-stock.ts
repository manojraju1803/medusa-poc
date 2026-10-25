import { MedusaContainer } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import {
  LOW_STOCK_THRESHOLD_KEY,
  readItemThresholds,
  readThreshold,
  resolveThreshold,
  ThresholdSource,
} from './monitoring';

export type SellingWarehouse = {
  id: string;
  name: string;
  // The warehouse's own default, or null when it uses the standard 10.
  default_threshold: number | null;
};

export type LowStockRow = {
  inventory_item_id: string;
  title: string;
  sku: string | null;
  warehouse: string;
  available: number;
  threshold: number;
  threshold_source: ThresholdSource;
};

export type LowStock = {
  warehouses: SellingWarehouse[];
  // Items low at one or more warehouses, each counted once.
  count: number;
  // One row per item and warehouse, lowest stock first.
  rows: LowStockRow[];
};

/**
 * Warehouses whose stock the store sells from: those linked to a sales
 * channel. Others, such as test warehouses, are left out of low stock.
 */
export async function sellingWarehouses(
  container: MedusaContainer,
): Promise<SellingWarehouse[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: locations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name', 'metadata', 'sales_channels.id'],
  });

  return locations
    .filter((location) => (location.sales_channels ?? []).length > 0)
    .map((location) => ({
      id: location.id,
      name: location.name,
      default_threshold: readThreshold(location.metadata?.[LOW_STOCK_THRESHOLD_KEY]),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Items whose stock left after reservations is at or below their threshold at
 * a selling warehouse. Each warehouse is checked against its own threshold:
 * the item's own number for that warehouse, else the warehouse's default,
 * else the standard 10.
 */
export async function findLowStock(container: MedusaContainer): Promise<LowStock> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const warehouses = await sellingWarehouses(container);
  const warehouseById = new Map(warehouses.map((warehouse) => [warehouse.id, warehouse]));

  const empty: LowStock = { warehouses, count: 0, rows: [] };
  if (!warehouses.length) {
    return empty;
  }

  const { data: levels } = await query.graph({
    entity: 'inventory_level',
    fields: ['inventory_item_id', 'location_id', 'stocked_quantity', 'reserved_quantity'],
    filters: { location_id: warehouses.map((warehouse) => warehouse.id) },
  });
  if (!levels.length) {
    return empty;
  }

  const { data: items } = await query.graph({
    entity: 'inventory_item',
    fields: ['id', 'sku', 'title', 'metadata', 'variants.product.title'],
    filters: { id: [...new Set(levels.map((level) => level.inventory_item_id))] },
  });
  const itemById = new Map(items.map((item) => [item.id, item]));

  const rows = levels.flatMap((level): LowStockRow[] => {
    const item = itemById.get(level.inventory_item_id);
    const warehouse = warehouseById.get(level.location_id);
    if (!item || !warehouse) {
      return [];
    }
    const { threshold, source } = resolveThreshold(
      readItemThresholds(item.metadata)[warehouse.id],
      warehouse.default_threshold,
    );
    const available =
      (Number(level.stocked_quantity) || 0) - (Number(level.reserved_quantity) || 0);
    if (available > threshold) {
      return [];
    }
    return [
      {
        inventory_item_id: item.id,
        title: item.variants?.[0]?.product?.title ?? item.title ?? item.sku ?? item.id,
        sku: item.sku ?? null,
        warehouse: warehouse.name,
        available,
        threshold,
        threshold_source: source,
      },
    ];
  });

  // A complete order, so paging never repeats or skips a row between requests.
  rows.sort(
    (a, b) =>
      a.available - b.available ||
      a.title.localeCompare(b.title) ||
      a.warehouse.localeCompare(b.warehouse) ||
      a.inventory_item_id.localeCompare(b.inventory_item_id),
  );

  return {
    warehouses,
    count: new Set(rows.map((row) => row.inventory_item_id)).size,
    rows,
  };
}
