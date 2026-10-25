import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import {
  summariseOrders,
  TrendOrder,
  trendWindow,
} from '../../../utils/monitoring';
import { AdminGetTrendsParams } from '../middlewares';

const PAGE_SIZE = 200;

const ORDER_FIELDS = [
  'id',
  'created_at',
  'total',
  'email',
  'customer_id',
  'customer.first_name',
  'customer.last_name',
  'customer.company_name',
  'items.product_id',
  'items.product_title',
  'items.title',
  'items.quantity',
  'items.total',
];

type OrderRow = {
  id: string;
  created_at: string | Date;
  total: unknown;
  email?: string | null;
  customer_id?: string | null;
  customer?: {
    first_name?: string | null;
    last_name?: string | null;
    company_name?: string | null;
  } | null;
  items?: ({
    product_id?: string | null;
    product_title?: string | null;
    title?: string | null;
    quantity?: unknown;
    total?: unknown;
  } | null)[] | null;
};

/**
 * Orders and sales over time, top products and top customers, for the admin
 * Trends page. A sale is a placed order that isn't a draft or cancelled,
 * counted at its full total (items + shipping + GST) in the store's default
 * currency, on the India-time day it was placed.
 */
export async function GET(
  req: MedusaRequest<unknown, AdminGetTrendsParams>,
  res: MedusaResponse,
) {
  const { range } = req.validatedQuery;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: stores } = await query.graph({
    entity: 'store',
    fields: ['supported_currencies.currency_code', 'supported_currencies.is_default'],
  });
  const currencyCode =
    stores[0]?.supported_currencies?.find((currency) => currency?.is_default)
      ?.currency_code ?? 'inr';

  const window = trendWindow(range, new Date());
  const placedInWindow = {
    is_draft_order: false,
    status: { $ne: 'canceled' },
    created_at: { $gte: window.startUtc },
  };

  const rows: OrderRow[] = [];
  for (let skip = 0; ; skip += PAGE_SIZE) {
    const { data, metadata } = await query.graph({
      entity: 'order',
      fields: ORDER_FIELDS,
      filters: { ...placedInWindow, currency_code: currencyCode },
      pagination: { skip, take: PAGE_SIZE, order: { created_at: 'ASC' } },
    });
    rows.push(...(data as OrderRow[]));
    if (skip + PAGE_SIZE >= (metadata?.count ?? 0)) {
      break;
    }
  }

  // Sales in other currencies can't be added to rupees, so they're counted
  // separately for the page to mention.
  const { metadata: otherCurrency } = await query.graph({
    entity: 'order',
    fields: ['id'],
    filters: { ...placedInWindow, currency_code: { $ne: currencyCode } },
    pagination: { skip: 0, take: 1 },
  });

  const orders: TrendOrder[] = rows.map((row) => {
    const name = [row.customer?.first_name, row.customer?.last_name]
      .filter(Boolean)
      .join(' ');
    return {
      id: row.id,
      created_at: new Date(row.created_at),
      total: Number(row.total) || 0,
      customer_key: row.customer_id ?? row.email ?? row.id,
      customer_name:
        row.customer?.company_name || name || row.email || 'Guest',
      customer_email: row.email ?? null,
      items: (row.items ?? []).flatMap((item) =>
        item
          ? [
              {
                product_key: item.product_id ?? item.title ?? 'unknown',
                product_title: item.product_title ?? item.title ?? 'Unknown product',
                quantity: Number(item.quantity) || 0,
                total: Number(item.total) || 0,
              },
            ]
          : [],
      ),
    };
  });

  res.json({
    range,
    granularity: window.granularity,
    currency_code: currencyCode,
    from: window.keys[0],
    to: window.keys[window.keys.length - 1],
    other_currency_orders: otherCurrency?.count ?? 0,
    ...summariseOrders(orders, window),
  });
}
