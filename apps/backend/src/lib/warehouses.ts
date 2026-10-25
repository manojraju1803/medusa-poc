import { MedusaContainer } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

export type Warehouse = {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  is_default: boolean;
};

export type ResolvedLocation = {
  warehouse: Warehouse;
  /** Straight-line distance from the supplied coordinates, when there were any. */
  distance_km: number | null;
  /** `picked` and `saved` are set by the location route, not the resolver. */
  resolved_from: 'coordinates' | 'default' | 'picked' | 'saved';
};

const EARTH_RADIUS_KM = 6371;

/**
 * Warehouses that can take part in location matching.
 *
 * Coordinates live in stock location metadata because Medusa has no native
 * latitude/longitude field. A location whose metadata lacks usable numbers is
 * omitted rather than defaulted to (0, 0), where it would win comparisons it
 * has no business winning.
 *
 * Pass the request's sales channels to keep only the locations that channel
 * sells from, so a listing never shows stock the cart can't use.
 */
export async function listWarehouses(
  container: MedusaContainer,
  salesChannelIds?: string[],
): Promise<Warehouse[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: locations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name', 'metadata', 'address.city', 'sales_channels.id'],
  });

  const channels = salesChannelIds?.length ? new Set(salesChannelIds) : null;
  const warehouses: Warehouse[] = [];

  for (const location of locations) {
    const lat = Number(location.metadata?.lat);
    const lng = Number(location.metadata?.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      continue;
    }

    if (
      channels &&
      !location.sales_channels?.some((channel) => channel && channels.has(channel.id))
    ) {
      continue;
    }

    warehouses.push({
      id: location.id,
      name: location.name,
      // The address city is what the product page's location chips show.
      city: String(location.address?.city || location.metadata?.city || location.name),
      lat,
      lng,
      is_default: location.metadata?.is_default === true,
    });
  }

  warehouses.sort((a, b) => a.city.localeCompare(b.city));

  return warehouses;
}

/**
 * The warehouse to serve when there is nothing better to go on.
 *
 * Honours an explicit `is_default` flag in stock location metadata so the
 * client can move it without a code change, and falls back to the first city
 * alphabetically so the result is never undefined for a non-empty list.
 */
export function defaultWarehouse(
  warehouses: Warehouse[],
): Warehouse | undefined {
  return warehouses.find((warehouse) => warehouse.is_default) ?? warehouses[0];
}

/**
 * Picks the warehouse closest to a coordinate, or the default when the
 * coordinate is absent or unusable.
 *
 * Straight-line distance is deliberate: the result only needs to order
 * warehouses against each other, which a maps API would not improve.
 */
export function resolveLocation(
  warehouses: Warehouse[],
  lat?: number | null,
  lng?: number | null,
): ResolvedLocation | null {
  const fallback = defaultWarehouse(warehouses);

  if (!fallback) {
    return null;
  }

  if (!isUsableCoordinate(lat, lng)) {
    return { warehouse: fallback, distance_km: null, resolved_from: 'default' };
  }

  let nearest = fallback;
  let nearestKm = Number.POSITIVE_INFINITY;

  for (const warehouse of warehouses) {
    const km = distanceKm(lat as number, lng as number, warehouse.lat, warehouse.lng);

    if (km < nearestKm) {
      nearestKm = km;
      nearest = warehouse;
    }
  }

  return {
    warehouse: nearest,
    distance_km: Math.round(nearestKm * 10) / 10,
    resolved_from: 'coordinates',
  };
}

/**
 * Whether a coordinate pair is worth measuring against.
 *
 * Rejects out-of-range values as well as non-numbers, since a bad reading
 * would otherwise silently resolve to whichever warehouse sits nearest to a
 * meaningless point.
 */
export function isUsableCoordinate(
  lat?: number | null,
  lng?: number | null,
): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

/** Haversine great-circle distance in kilometres. */
export function distanceKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Units a warehouse can still sell: stocked minus already reserved by orders,
 * the same measure Medusa uses when it checks stock for a cart.
 */
export function availableQuantity(level: {
  stocked_quantity?: unknown;
  reserved_quantity?: unknown;
}): number {
  return (
    (Number(level.stocked_quantity) || 0) -
    (Number(level.reserved_quantity) || 0)
  );
}

/**
 * Product ids the given warehouse carries.
 *
 * Walks stock_location -> inventory_level -> inventory_item -> variant ->
 * product. Done as two narrow queries, the second on the variant/inventory
 * link filtered by item, rather than a deep graph traversal from `product`,
 * which loads every variant and level for the whole catalogue.
 *
 * "Carries" means it has a stock level there, even at zero: the range, not
 * the stock on hand, so the filter reveals no stock to unapproved buyers.
 */
export async function productIdsAt(
  container: MedusaContainer,
  warehouseId: string,
): Promise<string[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: levels } = await query.graph({
    entity: 'inventory_level',
    fields: ['inventory_item_id'],
    filters: { location_id: warehouseId },
  });

  const itemIds = new Set(levels.map((level) => level.inventory_item_id));

  if (!itemIds.size) {
    return [];
  }

  const { data: links } = await query.graph({
    entity: 'product_variant_inventory_item',
    fields: ['variant.product_id'],
    filters: { inventory_item_id: [...itemIds] },
  });

  const productIds = new Set<string>();

  for (const link of links) {
    if (link.variant?.product_id) {
      productIds.add(link.variant.product_id);
    }
  }

  return [...productIds];
}
