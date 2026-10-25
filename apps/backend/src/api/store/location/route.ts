import type {
  MedusaResponse,
  MedusaStoreRequest,
} from '@medusajs/framework/http';
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils';
import { updateCustomersWorkflow } from '@medusajs/medusa/core-flows';

import {
  listWarehouses,
  resolveLocation,
  type ResolvedLocation,
  type Warehouse,
} from '../../../lib/warehouses';
import type { StoreGetLocationParams, StorePostLocation } from './middlewares';

/** Customer metadata key holding the warehouse a buyer resolved to previously. */
export const PREFERRED_WAREHOUSE_KEY = 'preferred_warehouse_id';

type LocationResponse = {
  location: {
    warehouse_id: string;
    city: string;
    name: string;
    lat: number;
    lng: number;
    distance_km: number | null;
    resolved_from: ResolvedLocation['resolved_from'];
    saved: boolean;
  };
  warehouses: Array<Pick<Warehouse, 'id' | 'city' | 'name'>>;
};

/**
 * Sets the buyer's warehouse: the one they picked (`warehouse_id`), else the
 * one nearest a browser coordinate.
 *
 * Accepts null or missing coordinates on purpose: a buyer who declines the
 * browser permission prompt still needs an answer, and that answer is the
 * default warehouse rather than an error.
 */
export const POST = async (
  req: MedusaStoreRequest<StorePostLocation>,
  res: MedusaResponse,
) => {
  const { warehouse_id, lat, lng } = req.validatedBody;

  const warehouses = await listWarehouses(
    req.scope,
    req.publishable_key_context.sales_channel_ids,
  );

  let resolved: ResolvedLocation | null;

  if (warehouse_id) {
    const picked = warehouses.find((warehouse) => warehouse.id === warehouse_id);

    if (!picked) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Warehouse ${warehouse_id} is not available.`,
      );
    }

    resolved = { warehouse: picked, distance_km: null, resolved_from: 'picked' };
  } else {
    resolved = resolveLocation(warehouses, lat, lng);
  }

  if (!resolved) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      'No warehouse has coordinates configured, so a location cannot be resolved.',
    );
  }

  // Remembering the choice server-side is what makes it survive a new device.
  // Guests simply do not get that, which is why `saved` is reported back.
  const saved = await savePreference(req, resolved.warehouse.id);

  res.json(toResponse(resolved, warehouses, saved));
};

/**
 * Reports the location currently in force.
 *
 * A signed-in buyer gets what they resolved to last time; everyone else gets
 * the default. Coordinates may be supplied to preview a resolution without
 * saving it, which keeps GET free of side effects.
 */
export const GET = async (
  req: MedusaStoreRequest<unknown, StoreGetLocationParams>,
  res: MedusaResponse,
) => {
  const { lat, lng } = req.validatedQuery as StoreGetLocationParams;

  const warehouses = await listWarehouses(
    req.scope,
    req.publishable_key_context.sales_channel_ids,
  );
  const fallback = resolveLocation(warehouses, null, null);

  if (!fallback) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      'No warehouse has coordinates configured, so a location cannot be resolved.',
    );
  }

  if (lat !== undefined && lng !== undefined) {
    return res.json(toResponse(resolveLocation(warehouses, lat, lng)!, warehouses, false));
  }

  const savedId = await readPreference(req);
  const savedWarehouse = savedId
    ? warehouses.find((warehouse) => warehouse.id === savedId)
    : undefined;

  if (savedWarehouse) {
    return res.json(
      toResponse(
        { warehouse: savedWarehouse, distance_km: null, resolved_from: 'saved' },
        warehouses,
        true,
      ),
    );
  }

  res.json(toResponse(fallback, warehouses, false));
};

function toResponse(
  resolved: ResolvedLocation,
  warehouses: Warehouse[],
  saved: boolean,
): LocationResponse {
  return {
    location: {
      warehouse_id: resolved.warehouse.id,
      city: resolved.warehouse.city,
      name: resolved.warehouse.name,
      lat: resolved.warehouse.lat,
      lng: resolved.warehouse.lng,
      distance_km: resolved.distance_km,
      resolved_from: resolved.resolved_from,
      saved,
    },
    warehouses: warehouses.map(({ id, city, name }) => ({ id, city, name })),
  };
}

function customerId(req: MedusaStoreRequest): string | undefined {
  return req.auth_context?.actor_id;
}

async function readPreference(req: MedusaStoreRequest): Promise<string | undefined> {
  const actorId = customerId(req);

  if (!actorId) {
    return undefined;
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data } = await query.graph({
    entity: 'customer',
    fields: ['id', 'metadata'],
    filters: { id: actorId },
  });

  const stored = data[0]?.metadata?.[PREFERRED_WAREHOUSE_KEY];

  return typeof stored === 'string' && stored ? stored : undefined;
}

/**
 * Persists the resolved warehouse against the signed-in customer.
 *
 * Existing metadata is read and merged rather than replaced, because the update
 * overwrites the whole JSONB column and other features keep their own keys there.
 */
async function savePreference(
  req: MedusaStoreRequest,
  warehouseId: string,
): Promise<boolean> {
  const actorId = customerId(req);

  if (!actorId) {
    return false;
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data } = await query.graph({
    entity: 'customer',
    fields: ['id', 'metadata'],
    filters: { id: actorId },
  });

  if (!data[0]) {
    return false;
  }

  await updateCustomersWorkflow(req.scope).run({
    input: {
      selector: { id: actorId },
      update: {
        metadata: {
          ...(data[0].metadata ?? {}),
          [PREFERRED_WAREHOUSE_KEY]: warehouseId,
        },
      },
    },
  });

  return true;
}
