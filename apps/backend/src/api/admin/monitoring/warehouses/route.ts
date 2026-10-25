import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { sellingWarehouses } from '../../../utils/low-stock';
import { FALLBACK_LOW_STOCK_THRESHOLD } from '../../../utils/monitoring';

/**
 * The warehouses low stock is checked at, with each one's default threshold,
 * for the Low-stock alert box on inventory item pages.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({
    warehouses: await sellingWarehouses(req.scope),
    fallback_threshold: FALLBACK_LOW_STOCK_THRESHOLD,
  });
}
