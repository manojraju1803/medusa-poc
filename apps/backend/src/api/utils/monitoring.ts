/**
 * Shared logic for the admin Trends page: date windows in India time, adding
 * up orders, ranking, and low-stock thresholds. Pure functions only, so the
 * numbers can be checked without a database. The admin widgets import the
 * threshold helpers too, so keep this file free of server-only imports.
 */

export const TREND_RANGES = ['7d', '30d', '90d', '12m'] as const;
export type TrendRange = (typeof TREND_RANGES)[number];
export type Granularity = 'day' | 'month';

// Orders are stored in UTC but the business runs on India time. India has no
// daylight saving, so a fixed offset is exact.
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

const DAYS_IN_RANGE: Record<Exclude<TrendRange, '12m'>, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export type TrendWindow = {
  granularity: Granularity;
  // Bucket keys, oldest first: YYYY-MM-DD for days, YYYY-MM for months.
  keys: string[];
  // The first instant of the window, in UTC.
  startUtc: Date;
};

/** The India-time day or month a moment falls in. */
export function istKey(moment: Date, granularity: Granularity): string {
  const iso = new Date(moment.getTime() + IST_OFFSET_MS).toISOString();
  return granularity === 'day' ? iso.slice(0, 10) : iso.slice(0, 7);
}

/** Midnight India time on the given IST date, as a UTC instant. */
function istMidnight(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day) - IST_OFFSET_MS);
}

/**
 * The buckets for a range, ending with the current India-time day (or month
 * for 12m), and the moment the window starts.
 */
export function trendWindow(range: TrendRange, now: Date): TrendWindow {
  const today = new Date(now.getTime() + IST_OFFSET_MS);
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();

  if (range === '12m') {
    const keys: string[] = [];
    for (let back = 11; back >= 0; back--) {
      keys.push(new Date(Date.UTC(year, month - back, 1)).toISOString().slice(0, 7));
    }
    return {
      granularity: 'month',
      keys,
      startUtc: istMidnight(year, month - 11, 1),
    };
  }

  const days = DAYS_IN_RANGE[range];
  const date = today.getUTCDate();
  const keys: string[] = [];
  for (let back = days - 1; back >= 0; back--) {
    keys.push(new Date(Date.UTC(year, month, date - back)).toISOString().slice(0, 10));
  }
  return {
    granularity: 'day',
    keys,
    startUtc: istMidnight(year, month, date - (days - 1)),
  };
}

export type TrendOrder = {
  id: string;
  created_at: Date;
  // What the buyer pays: items + shipping + GST.
  total: number;
  customer_key: string;
  customer_name: string;
  customer_email: string | null;
  items: {
    product_key: string;
    product_title: string;
    quantity: number;
    // Includes GST, like the order total.
    total: number;
  }[];
};

export type TrendBucket = { key: string; orders: number; sales: number };

export type TopProduct = {
  product_key: string;
  title: string;
  quantity: number;
  orders: number;
  sales: number;
};

export type TopCustomer = {
  customer_key: string;
  name: string;
  email: string | null;
  orders: number;
  sales: number;
};

export type TrendSummary = {
  buckets: TrendBucket[];
  totals: { orders: number; sales: number; average_order: number };
  top_products: TopProduct[];
  top_customers: TopCustomer[];
};

export const TOP_LIMIT = 10;

// Money is stored as-is (₹49.99 is 49.99); round sums to paise to avoid
// floating-point dust.
const toPaise = (amount: number) => Math.round(amount * 100) / 100;

/**
 * Orders and sales per bucket, plus the top products and customers by sales.
 * Orders outside the window's buckets are ignored.
 */
export function summariseOrders(
  orders: TrendOrder[],
  window: TrendWindow,
): TrendSummary {
  const buckets = new Map<string, TrendBucket>(
    window.keys.map((key) => [key, { key, orders: 0, sales: 0 }]),
  );
  const products = new Map<string, TopProduct & { orderIds: Set<string> }>();
  const customers = new Map<string, TopCustomer>();

  let orderCount = 0;
  let salesTotal = 0;

  for (const order of orders) {
    const bucket = buckets.get(istKey(order.created_at, window.granularity));
    if (!bucket) {
      continue;
    }

    bucket.orders += 1;
    bucket.sales += order.total;
    orderCount += 1;
    salesTotal += order.total;

    const customer = customers.get(order.customer_key) ?? {
      customer_key: order.customer_key,
      name: order.customer_name,
      email: order.customer_email,
      orders: 0,
      sales: 0,
    };
    customer.orders += 1;
    customer.sales += order.total;
    customers.set(order.customer_key, customer);

    for (const item of order.items) {
      const product = products.get(item.product_key) ?? {
        product_key: item.product_key,
        title: item.product_title,
        quantity: 0,
        orders: 0,
        sales: 0,
        orderIds: new Set<string>(),
      };
      product.quantity += item.quantity;
      product.sales += item.total;
      product.orderIds.add(order.id);
      products.set(item.product_key, product);
    }
  }

  const bySalesThenName = <T extends { sales: number }>(
    name: (row: T) => string,
  ) => (a: T, b: T) => b.sales - a.sales || name(a).localeCompare(name(b));

  return {
    buckets: [...buckets.values()].map((bucket) => ({
      ...bucket,
      sales: toPaise(bucket.sales),
    })),
    totals: {
      orders: orderCount,
      sales: toPaise(salesTotal),
      average_order: orderCount ? toPaise(salesTotal / orderCount) : 0,
    },
    top_products: [...products.values()]
      .map(({ orderIds, ...product }) => ({
        ...product,
        orders: orderIds.size,
        sales: toPaise(product.sales),
      }))
      .sort(bySalesThenName((row) => row.title))
      .slice(0, TOP_LIMIT),
    top_customers: [...customers.values()]
      .map((customer) => ({ ...customer, sales: toPaise(customer.sales) }))
      .sort(bySalesThenName((row) => row.name))
      .slice(0, TOP_LIMIT),
  };
}

// Low-stock thresholds are set per warehouse. A warehouse's default lives in
// its stock location's metadata under this key.
export const LOW_STOCK_THRESHOLD_KEY = 'low_stock_threshold';

// An item's own thresholds live in its inventory item's metadata under this
// key, as { [stock location id]: threshold }. Stock levels have no metadata
// that Medusa's admin API can write, so the item holds one number per warehouse.
export const ITEM_THRESHOLDS_KEY = 'low_stock_thresholds';

// Used when a warehouse has no default of its own.
export const FALLBACK_LOW_STOCK_THRESHOLD = 10;

/**
 * A threshold read from metadata, or null when it isn't a whole number of 0
 * or more. The admin's metadata editor saves values as text, so "25" counts.
 */
export function readThreshold(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const threshold = Number(value);
  return Number.isInteger(threshold) && threshold >= 0 ? threshold : null;
}

/** An item's own thresholds by warehouse id, keeping only valid numbers. */
export function readItemThresholds(
  metadata: Record<string, unknown> | null | undefined,
): Record<string, number> {
  const stored = metadata?.[ITEM_THRESHOLDS_KEY];
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return {};
  }
  const thresholds: Record<string, number> = {};
  for (const [locationId, value] of Object.entries(stored)) {
    const threshold = readThreshold(value);
    if (threshold !== null) {
      thresholds[locationId] = threshold;
    }
  }
  return thresholds;
}

export type ThresholdSource = 'item' | 'warehouse' | 'standard';

/**
 * The threshold for an item at one warehouse: the item's own number there,
 * else that warehouse's default, else the standard 10.
 */
export function resolveThreshold(
  itemThreshold: number | undefined,
  warehouseDefault: number | null,
): { threshold: number; source: ThresholdSource } {
  if (itemThreshold !== undefined) {
    return { threshold: itemThreshold, source: 'item' };
  }
  if (warehouseDefault !== null) {
    return { threshold: warehouseDefault, source: 'warehouse' };
  }
  return { threshold: FALLBACK_LOW_STOCK_THRESHOLD, source: 'standard' };
}
