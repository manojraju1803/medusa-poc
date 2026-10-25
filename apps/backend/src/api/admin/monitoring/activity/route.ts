import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { APPROVED_GROUP, UNAPPROVED_GROUP } from '../../../utils/is-approved';
import { findLowStock } from '../../../utils/low-stock';

const INQUIRY_TYPES = ['quote_sample', 'contact', 'supplier_registration'] as const;

/**
 * Counts for the admin Trends page: accounts waiting for approval, new
 * inquiries, and items at or below their low-stock threshold. The low-stock
 * items themselves are listed page by page by /admin/monitoring/low-stock.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const count = async (entity: string, filters: Record<string, unknown>) =>
    (
      await query.graph({
        entity,
        fields: ['id'],
        filters,
        pagination: { skip: 0, take: 1 },
      })
    ).metadata?.count ?? 0;

  // Pending = registered and not yet in the group that unlocks prices, the
  // same rule the storefront uses (see is-approved.ts).
  const [registered, approved, unapprovedGroup, lowStock, ...newByType] = await Promise.all([
    count('customer', { has_account: true }),
    count('customer', { has_account: true, groups: { name: APPROVED_GROUP } }),
    // Where sign-ups wait, for the page to link to. The admin creates it by hand.
    query.graph({
      entity: 'customer_group',
      fields: ['id'],
      filters: { name: UNAPPROVED_GROUP },
    }),
    findLowStock(req.scope),
    ...INQUIRY_TYPES.map((type) => count('inquiry', { status: 'new', type })),
  ]);

  const byType = Object.fromEntries(
    INQUIRY_TYPES.map((type, index) => [type, newByType[index]]),
  ) as Record<(typeof INQUIRY_TYPES)[number], number>;

  res.json({
    pending_approvals: registered - approved,
    unapproved_group_id: unapprovedGroup.data[0]?.id ?? null,
    new_inquiries: {
      total: newByType.reduce((sum, value) => sum + value, 0),
      by_type: byType,
    },
    low_stock: {
      warehouses: lowStock.warehouses.map((warehouse) => warehouse.name),
      count: lowStock.count,
    },
  });
}
