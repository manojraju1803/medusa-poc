import { ExecArgs } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { updateStockLocationsWorkflow } from '@medusajs/medusa/core-flows';

/**
 * Coordinates for the location-based product listing.
 *
 * Run from apps/backend:
 *   pnpm medusa exec ./src/scripts/seed-warehouses.ts
 *
 * Adds the `lat`, `lng` and `is_default` metadata that `src/lib/warehouses.ts`
 * reads to the existing stock locations, matched by address city. It creates
 * no locations and touches no stock, so the warehouses, their sales channels
 * and their stock stay exactly as they are. Safe to run again.
 */

type Coordinates = { lat: number; lng: number; is_default: boolean };

// Keyed by lower-case address city; Bengaluru is Bangalore's official name.
const COORDINATES: Record<string, Coordinates> = {
  bangalore: { lat: 12.9716, lng: 77.5946, is_default: true },
  bengaluru: { lat: 12.9716, lng: 77.5946, is_default: true },
  mumbai: { lat: 19.076, lng: 72.8777, is_default: false },
  delhi: { lat: 28.6139, lng: 77.209, is_default: false },
};

export default async function seedWarehouses({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: locations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name', 'metadata', 'address.city'],
  });

  let updated = 0;

  for (const location of locations) {
    const city = location.address?.city?.trim().toLowerCase();
    const coordinates = city ? COORDINATES[city] : undefined;

    if (!coordinates) {
      logger.info(`Skipped ${location.name}: no coordinates for city "${city ?? ''}".`);
      continue;
    }

    await updateStockLocationsWorkflow(container).run({
      input: {
        selector: { id: location.id },
        update: { metadata: { ...(location.metadata ?? {}), ...coordinates } },
      },
    });
    updated++;
    logger.info(`${location.name}: coordinates set.`);
  }

  logger.info(`Warehouse coordinates ready on ${updated} of ${locations.length} locations.`);
}
