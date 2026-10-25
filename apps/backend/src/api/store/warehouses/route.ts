import type { MedusaResponse, MedusaStoreRequest } from '@medusajs/framework/http';

import { listWarehouses } from '../../../lib/warehouses';

/**
 * Lists the warehouses a buyer can be matched against.
 *
 * See `src/lib/warehouses.ts` for why coordinates live in stock location
 * metadata and what disqualifies a location from appearing here.
 */
export const GET = async (req: MedusaStoreRequest, res: MedusaResponse) => {
  const warehouses = await listWarehouses(
    req.scope,
    req.publishable_key_context.sales_channel_ids,
  );

  res.json({ warehouses });
};
