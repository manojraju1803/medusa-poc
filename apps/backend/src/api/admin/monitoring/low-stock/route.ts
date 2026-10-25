import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { findLowStock } from '../../../utils/low-stock';
import { AdminGetLowStockParams } from '../middlewares';

/**
 * Low-stock items for the admin Trends page, one page at a time: one row per
 * item and warehouse, lowest stock first.
 */
export async function GET(
  req: MedusaRequest<unknown, AdminGetLowStockParams>,
  res: MedusaResponse,
) {
  const { offset, limit } = req.validatedQuery;
  const lowStock = await findLowStock(req.scope);

  res.json({
    rows: lowStock.rows.slice(offset, offset + limit),
    // For paging: rows, not items, since an item can be low at two warehouses.
    count: lowStock.rows.length,
    offset,
    limit,
  });
}
