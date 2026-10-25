import { ExecArgs } from '@medusajs/framework/types';
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from '@medusajs/framework/utils';
import {
  cancelOrderWorkflow,
  createOrderWorkflow,
} from '@medusajs/medusa/core-flows';

/**
 * Test orders for the admin Trends page, with known numbers to check against.
 *
 * Run from apps/backend:
 *   pnpm medusa exec ./src/scripts/seed-test-orders.ts
 *
 * Places about a dozen orders through Medusa's own order workflow, spread over
 * the last 45 days, then prints what the Trends page should show. Each order
 * is marked with `metadata.test_data`, and running the script again replaces
 * the previous test orders. Orders don't reserve stock, so stock levels are
 * unchanged.
 *
 * Medusa's order workflow has no way to set the date an order was placed, so
 * the script moves `created_at` with one direct database update per order.
 * That is acceptable for test data only.
 */

const TEST_TAG = 'monitoring-trends';
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

type PlannedOrder = {
  daysAgo: number;
  // India time on that day, e.g. 0.5 is 00:30.
  istHour: number;
  customer: number;
  // [product index, quantity, unit price]
  lines: [number, number, number][];
  cancel?: boolean;
  currency?: 'inr' | 'eur';
};

// Covers the cases the numbers must get right: a few orders a day, an order
// just after midnight India time (still the previous day in UTC), the first
// and last day of the 30-day window, a cancelled order and a euro order.
const PLAN: PlannedOrder[] = [
  { daysAgo: 0, istHour: 0.5, customer: 0, lines: [[0, 25, 320]] },
  { daysAgo: 0, istHour: 0.75, customer: 1, lines: [[1, 10, 150], [2, 5, 90]] },
  { daysAgo: 1, istHour: 15, customer: 2, lines: [[3, 40, 75]] },
  { daysAgo: 2, istHour: 10, customer: 0, lines: [[0, 50, 310], [3, 10, 75]] },
  { daysAgo: 3, istHour: 13, customer: 0, lines: [[2, 10, 90]], cancel: true },
  { daysAgo: 4, istHour: 18, customer: 1, lines: [[2, 20, 90]] },
  { daysAgo: 5, istHour: 13, customer: 1, lines: [[0, 5, 4]], currency: 'eur' },
  { daysAgo: 6, istHour: 9, customer: 0, lines: [[1, 30, 145]] },
  { daysAgo: 6, istHour: 23.75, customer: 2, lines: [[0, 100, 300]] },
  { daysAgo: 9, istHour: 12, customer: 1, lines: [[3, 60, 70]] },
  { daysAgo: 15, istHour: 14, customer: 2, lines: [[2, 15, 95], [1, 5, 150]] },
  { daysAgo: 29, istHour: 16, customer: 0, lines: [[0, 25, 320]] },
  { daysAgo: 30, istHour: 16, customer: 1, lines: [[1, 10, 150]] },
  { daysAgo: 45, istHour: 11, customer: 2, lines: [[3, 20, 75]] },
];

const PROVINCES = ['in-ka', 'in-mh'];

export default async function seedTestOrders({ container }: ExecArgs) {
  // Fake orders on real customers: never on a shared database.
  if (!/@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL ?? '')) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      'seed-test-orders only runs against a local database.',
    );
  }

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION);

  // 1. Remove the previous run's test orders.
  const { data: existing } = await query.graph({
    entity: 'order',
    fields: ['id', 'metadata'],
  });
  const previous = existing
    .filter((order) => order.metadata?.test_data === TEST_TAG)
    .map((order) => order.id);
  if (previous.length) {
    await container.resolve(Modules.ORDER).softDeleteOrders(previous);
    logger.info(`Removed ${previous.length} test orders from the previous run.`);
  }

  // 2. Approved buyers, regions and products with enough stock.
  const { data: approved } = await query.graph({
    entity: 'customer',
    fields: ['id', 'email', 'first_name', 'last_name'],
    filters: { has_account: true, groups: { name: 'Approved' } },
  });
  const customers = approved
    .flatMap((customer) =>
      customer.email ? [{ ...customer, email: customer.email }] : [],
    )
    .sort((a, b) => a.email.localeCompare(b.email));
  if (!customers.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      'No approved customers to place test orders for.',
    );
  }

  const { data: regions } = await query.graph({
    entity: 'region',
    fields: ['id', 'currency_code'],
  });
  const regionFor = (currency: string) =>
    regions.find((r) => r.currency_code === currency)?.id;

  const { data: levels } = await query.graph({
    entity: 'inventory_level',
    fields: ['inventory_item_id', 'stocked_quantity', 'reserved_quantity'],
  });
  const stocked = new Set(
    levels
      .filter(
        (level) =>
          Number(level.stocked_quantity) - Number(level.reserved_quantity) >= 100,
      )
      .map((level) => level.inventory_item_id),
  );
  const { data: variants } = await query.graph({
    entity: 'product_variant',
    fields: ['id', 'title', 'product.title', 'inventory_items.inventory_item_id'],
  });
  const products = variants
    .filter((variant) =>
      (variant.inventory_items ?? []).some(
        (link) => link?.inventory_item_id && stocked.has(link.inventory_item_id),
      ),
    )
    .sort((a, b) => (a.product?.title ?? '').localeCompare(b.product?.title ?? ''))
    .slice(0, 4);
  if (products.length < 4) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      'Need 4 products with at least 100 in stock.',
    );
  }

  // 3. Place, cancel and date the orders.
  const now = new Date();
  const today = new Date(now.getTime() + IST_OFFSET_MS);
  let placed = 0;

  for (const [index, plan] of PLAN.entries()) {
    const customer = customers[plan.customer % customers.length];
    const currency = plan.currency ?? 'inr';
    const regionId = regionFor(currency);
    if (!regionId) {
      // The euro order only checks that other currencies are left out.
      logger.info(`Skipped a test order in ${currency}: no region uses it.`);
      continue;
    }
    const address = {
      first_name: customer.first_name || 'Test',
      last_name: customer.last_name || 'Buyer',
      address_1: 'Test address',
      city: index % 2 ? 'Mumbai' : 'Bengaluru',
      province: PROVINCES[index % 2],
      postal_code: index % 2 ? '400001' : '560001',
      country_code: 'in',
    };

    const { result: order } = await createOrderWorkflow(container).run({
      input: {
        region_id: regionId,
        currency_code: currency,
        customer_id: customer.id,
        email: customer.email,
        shipping_address: address,
        billing_address: address,
        items: plan.lines.map(([product, quantity, unitPrice]) => ({
          variant_id: products[product].id,
          title: products[product].title || 'Test item',
          quantity,
          unit_price: unitPrice,
          is_tax_inclusive: false,
        })),
        metadata: { test_data: TEST_TAG },
      },
    });

    if (plan.cancel) {
      await cancelOrderWorkflow(container).run({ input: { order_id: order.id } });
    }

    const placedAt = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() - plan.daysAgo,
      ) -
        IST_OFFSET_MS +
        plan.istHour * 60 * 60 * 1000,
    );
    await pg('order').where({ id: order.id }).update({ created_at: placedAt });
    placed++;
  }

  logger.info(`Placed ${placed} test orders.`);
  await printExpected(container, logger);
}

/**
 * What the Trends page should show for the test orders, worked out here
 * without the page's own code. Other non-cancelled orders in the same period
 * would add to these numbers.
 */
async function printExpected(
  container: ExecArgs['container'],
  logger: { info: (message: string) => void },
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: 'order',
    fields: [
      'id', 'status', 'currency_code', 'created_at', 'total', 'metadata',
      'email', 'items.product_title', 'items.quantity', 'items.total',
    ],
  });
  const orders = data.filter(
    (order) =>
      order.metadata?.test_data === TEST_TAG &&
      order.status !== 'canceled' &&
      order.currency_code === 'inr',
  );

  const istDay = (value: string | Date) =>
    new Date(new Date(value).getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
  const todayKey = istDay(new Date());
  const daysBetween = (from: string, to: string) =>
    Math.round((Date.parse(to) - Date.parse(from)) / 86400000);

  const lines: string[] = ['', 'Expected numbers for the test orders (INR, India time):'];
  for (const days of [7, 30, 90]) {
    const inRange = orders.filter(
      (order) => daysBetween(istDay(order.created_at), todayKey) < days,
    );
    const sales = inRange.reduce((sum, order) => sum + Number(order.total), 0);
    lines.push(
      `  Last ${days} days: ${inRange.length} orders, sales ${sales.toFixed(2)}`,
    );
  }

  const last30 = orders.filter(
    (order) => daysBetween(istDay(order.created_at), todayKey) < 30,
  );
  const perDay = new Map<string, { orders: number; sales: number }>();
  const perProduct = new Map<string, { quantity: number; sales: number }>();
  const perCustomer = new Map<string, { orders: number; sales: number }>();
  for (const order of last30) {
    const day = perDay.get(istDay(order.created_at)) ?? { orders: 0, sales: 0 };
    day.orders += 1;
    day.sales += Number(order.total);
    perDay.set(istDay(order.created_at), day);

    const customer = perCustomer.get(order.email ?? '') ?? { orders: 0, sales: 0 };
    customer.orders += 1;
    customer.sales += Number(order.total);
    perCustomer.set(order.email ?? '', customer);

    for (const item of order.items ?? []) {
      const title = item?.product_title ?? 'Unknown';
      const product = perProduct.get(title) ?? { quantity: 0, sales: 0 };
      product.quantity += Number(item?.quantity);
      product.sales += Number(item?.total);
      perProduct.set(title, product);
    }
  }

  lines.push('  Last 30 days, by day:');
  for (const [day, value] of [...perDay].sort()) {
    lines.push(`    ${day}  ${value.orders} order(s)  ${value.sales.toFixed(2)}`);
  }
  lines.push('  Last 30 days, top products:');
  for (const [title, value] of [...perProduct].sort((a, b) => b[1].sales - a[1].sales)) {
    lines.push(`    ${value.sales.toFixed(2)}  qty ${value.quantity}  ${title}`);
  }
  lines.push('  Last 30 days, top customers:');
  for (const [email, value] of [...perCustomer].sort((a, b) => b[1].sales - a[1].sales)) {
    lines.push(`    ${value.sales.toFixed(2)}  ${value.orders} order(s)  ${email}`);
  }

  logger.info(lines.join('\n'));
}
