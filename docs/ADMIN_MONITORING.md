# Admin monitoring: Trends, activity counts and low stock

Sales and activity trends for the store team, inside the Medusa admin. It adds a
**Trends** page to the admin sidebar and two small boxes on existing admin pages
for low-stock thresholds.

Branch: `feature/admin-monitoring`. No new database tables, migrations or packages.

## What admins see

**Trends** (admin sidebar, `/app/trends`):

- **Activity counts**: pending approvals, new inquiries (split by type) and items
  low on stock. The first two link to the Unapproved customer group (or
  Customers, until that group exists) and Inquiries. They don't depend on the range.
- **Range picker**, in the **Orders and sales** header just above the charts:
  last 7, 30 or 90 days (one bar per day) or last 12 months (one bar per month).
  It changes the charts and the top products and customers below them.
- **Orders**: orders placed in the range, with a bar chart of orders per period.
- **Sales**: sales and average order value, with a bar chart of sales per period.
  Hover over a bar for that period's figure.
- **Top products** and **top customers**: the top 10 by sales in the range.
- **Low stock**: every item at or below its threshold, one row per warehouse,
  lowest stock first, 20 per page. Clicking a row opens the item's inventory page.

**Low-stock default** box: on a warehouse's page, under Settings → Locations &
Shipping → the warehouse.

**Low-stock alert** box: on an inventory item's page, under Inventory → the item.

## How the numbers are worked out

| Number | Rule |
|---|---|
| Orders, sales | Placed orders that are not drafts and not cancelled, in the store's default currency (INR). Sales are each order's full total: items, shipping and GST. Orders in other currencies are left out and mentioned in a note. |
| Days and months | India time (UTC+5:30). An order placed at 00:30 IST counts on that IST day, even though it is the previous day in UTC. |
| Top products | Quantity, number of orders and sales (GST included) per product, ranked by sales. |
| Top customers | Number of orders and sales per customer, ranked by sales. Shown by company name, else full name, else email. |
| Pending approvals | Registered accounts not in the `Approved` customer group: the same rule the storefront uses to hide prices (`APPROVED_GROUP` in `api/utils/is-approved.ts`). Its link opens the `Unapproved` customer group, where sign-ups wait, or the Customers list until that group exists. |
| New inquiries | Inquiries with status `new`, split into quote/sample, contact and supplier registration. |
| Low stock | Stock left after reservations (stocked minus reserved) at or below the threshold, checked separately at each warehouse that sells to the store, meaning one linked to a sales channel. Warehouses not linked to a sales channel are ignored. An item counts once, even if it is low at two warehouses. |

### Which low-stock threshold applies

For each item at each selling warehouse, the first of these that is set:

1. **The item's own number for that warehouse**, set in the item's **Low-stock alert** box.
2. **That warehouse's default**, set in the warehouse's **Low-stock default** box.
3. **10**.

The Threshold column on the Trends page shows which one applied: `(item)`,
`(warehouse)` or `(standard)`.

## How it fits together

```
Admin (browser)                                  Backend: /admin routes, admin login required
Trends page ──────────── GET /admin/monitoring/trends ────────┐
  count tiles ─────────── GET /admin/monitoring/activity ─────┤  api/utils/monitoring.ts (dates, adding up, thresholds)
  low-stock table ─────── GET /admin/monitoring/low-stock ────┤  api/utils/low-stock.ts  (which items are low)
Item page box ─────────── GET /admin/monitoring/warehouses ───┘
              └────────── POST /admin/inventory-items/:id    (Medusa's own endpoint, saves item thresholds)
Warehouse page box ────── POST /admin/stock-locations/:id    (Medusa's own endpoint, saves warehouse default)
```

## Files

All under `apps/backend/src/`.

### Backend

| File | What it does |
|---|---|
| `api/admin/monitoring/trends/route.ts` | `GET /admin/monitoring/trends`. Reads the store's default currency and works out the date window. Reads the orders in it with Query, 200 at a time, and returns the periods, totals, top products and top customers, plus a count of orders in other currencies. |
| `api/admin/monitoring/activity/route.ts` | `GET /admin/monitoring/activity`. Pending approvals (registered minus approved), the `Unapproved` group's id for the tile's link (`null` if it doesn't exist), new inquiries per type, and the low-stock count. |
| `api/admin/monitoring/low-stock/route.ts` | `GET /admin/monitoring/low-stock`. One page of the low-stock list, plus the total number of rows. |
| `api/admin/monitoring/warehouses/route.ts` | `GET /admin/monitoring/warehouses`. The selling warehouses with their defaults, for the item's Low-stock alert box. |
| `api/admin/monitoring/middlewares.ts` | Validates the query parameters of the trends and low-stock routes (Zod). |
| `api/middlewares.ts` | Registers `monitoringMiddlewares` (two added lines). |
| `api/utils/monitoring.ts` | Pure logic, no database: India-time periods (`trendWindow`, `istKey`), adding up and ranking (`summariseOrders`), and reading thresholds (`readThreshold`, `readItemThresholds`, `resolveThreshold`). The admin widgets import it too, so it must stay free of server-only imports. |
| `api/utils/low-stock.ts` | `sellingWarehouses`: warehouses linked to a sales channel, with their defaults. `findLowStock`: compares each item's stock at each selling warehouse with its threshold, and returns the rows in a fixed order so paging never repeats or skips a row. |
| `scripts/seed-test-orders.ts` | Test orders with known numbers (see [Test data](#test-data)). |

### Admin

| File | What it does |
|---|---|
| `admin/routes/trends/page.tsx` | The Trends page and its sidebar entry: range picker, count tiles, Orders and Sales charts (one shared `TrendChart` component), top products and customers, and the paged low-stock table (Medusa UI `DataTable`). |
| `admin/widgets/location-low-stock-default.tsx` | **Low-stock default** box (zone `location.details.side`). Saves the warehouse default. **Use standard (10)** clears it. Says so when the warehouse doesn't sell. |
| `admin/widgets/inventory-low-stock-threshold.tsx` | **Low-stock alert** box (zone `inventory_item.details.side`). One row per selling warehouse that holds the item, with stock left, a threshold box and a **Low** marker. One Save stores all rows; an empty box means "use the warehouse default". Reads stock and thresholds from the item the page loaded, so it updates with the page after a stock edit. |
| `admin/widgets/inventory-refresh-locations.tsx` | Shows nothing (zone `inventory_item.details.after`). Works around a bug in Medusa's admin (2.20.1, still in 2.22.0): after **Edit** or **Delete** on a stock level, Medusa reloads the item but not the **Locations** table, which kept its old numbers until a refresh. When the item's stock changes, this refreshes the table. Delete it once Medusa's `useUpdateInventoryLevel` and `useDeleteInventoryItemLevel` refresh the table themselves. |

The admin code reads data with React Query and plain `fetch` (the admin's session
cookie authenticates same-origin requests), the same pattern as the Inquiries page.
The Trends page loads its numbers again each time it opens, instead of reusing
what the admin loaded in the last 90 seconds, so stock edits and new orders made
elsewhere always show.

## API routes

All are admin routes, so they need an admin session or Bearer token, and return
`401` without one.

| Route | Parameters | Returns |
|---|---|---|
| `GET /admin/monitoring/trends` | `range`: `7d`, `30d` (default), `90d` or `12m`; anything else → `400` | `granularity`, `currency_code`, `from`, `to`, `buckets` (`key`, `orders`, `sales`), `totals` (`orders`, `sales`, `average_order`), `top_products`, `top_customers`, `other_currency_orders` |
| `GET /admin/monitoring/activity` | none | `pending_approvals`, `new_inquiries` (`total`, `by_type`), `low_stock` (`warehouses`, `count`) |
| `GET /admin/monitoring/low-stock` | `offset` ≥ 0 (default 0), `limit` 1–100 (default 20); otherwise `400` | `rows` (`inventory_item_id`, `title`, `sku`, `warehouse`, `available`, `threshold`, `threshold_source`), `count` (rows in total), `offset`, `limit` |
| `GET /admin/monitoring/warehouses` | none | `warehouses` (`id`, `name`, `default_threshold`), `fallback_threshold` (10) |

The widgets save through Medusa's own endpoints, so no new write routes were added:

| Endpoint | Used by | Sends |
|---|---|---|
| `POST /admin/stock-locations/:id` | Low-stock default box | `metadata.low_stock_threshold` |
| `POST /admin/inventory-items/:id` | Low-stock alert box | `metadata.low_stock_thresholds` |

Both send the record's existing metadata back with only the threshold changed, so
other keys are kept. An empty string removes the key.

## Data it stores

| What | Where | Format |
|---|---|---|
| A warehouse's default | the stock location's `metadata` | `low_stock_threshold: 25` |
| An item's own numbers | the inventory item's `metadata` | `low_stock_thresholds: { "<stock location id>": 20 }` |
| Test orders | the order's `metadata` | `test_data: "monitoring-trends"` |

Item thresholds sit on the inventory item, not on its stock levels, because
Medusa's admin API cannot write stock-level metadata.

## Test data

`scripts/seed-test-orders.ts` places about a dozen test orders with known numbers:

```bash
cd apps/backend
pnpm medusa exec ./src/scripts/seed-test-orders.ts
```

- It places the orders through Medusa's `createOrderWorkflow`, cancels one, spreads
  them over the last 45 days, and prints the totals the Trends page should show.
- They include an order just after midnight India time, an order on the first day
  of the 30-day window, one just outside it, and a cancelled order.
- Running it again removes the previous test orders and places new ones.
- It needs approved customers and 4 products with at least 100 in stock; the
  shared data has both.
- A euro order is skipped when no region uses euros (the case today).
- Orders are dated relative to the day it runs, so re-run it before checking the
  numbers on a later day.
- Medusa's order workflow cannot set an order's date, so the script moves
  `created_at` with one direct database update. **Run it against a local database
  only, never a shared or live one.**
- Test orders don't reserve stock, so they don't change the low-stock numbers.

## Verification

Status on 22 October 2026, local database with the test orders.

**Automated checks against SQL: 16 of 16 pass.** Each route was compared with SQL
that applies the same rules independently, on the data as it was that day:

- trends for 7, 30 and 90 days: every day's orders and sales (GST included) match;
  12 months returns 12 monthly periods;
- pending approvals, new inquiries and low stock match, low stock under the
  per-warehouse rule;
- the low-stock pages together return every row exactly once (86 rows);
- the warehouses route returns exactly the warehouses linked to a sales channel;
- an unknown range, `limit` over 100 and a negative `offset` are rejected with `400`;
- all four routes return `401` without an admin login.

**Earlier checks, 21 October**, right after running the seed:

- Totals matched the seed's printed numbers for every range: 7 days, 7 orders,
  ₹77,113.00; 30 days, 10 orders, ₹94,075.50; 90 days and 12 months, 12 orders,
  ₹97,615.50. Every day in the 30-day view, the top products and the top customers
  also matched.
- The cancelled order and the order 30 days back were left out of the 30-day view.
- Thresholds, using the same requests the boxes send:

  | Change | Low stock |
  |---|---|
  | Start, standard 10 everywhere | 86 |
  | India Warehouse default 5 | 80 |
  | Cardamom flavour's own 20 at India Warehouse (15 left) | 81 |
  | A number for a warehouse that doesn't sell | ignored, still 81 |
  | Item number removed | 80 |
  | Warehouse default removed | 86 |

- Saving a threshold kept the record's other metadata, and clearing it removed
  the key.

**Code:** `pnpm medusa lint` reports no problems in these files (the 2 warnings
are in the existing inquiry routes), and `pnpm build` completes for backend and
admin.

### Manual checks in the admin

Run these in a browser after any change to the page or the boxes:

- [ ] Trends appears in the sidebar and loads.
- [ ] Changing the range updates both charts, the totals and the top lists.
- [ ] Hovering over a bar shows that period's orders (Orders chart) or sales (Sales chart).
- [ ] Approving a pending buyer (Customers → the buyer → IB Approval) lowers Pending approvals by 1 when Trends is opened again.
- [ ] With an `Unapproved` customer group, **Review unapproved customers** opens it. Without one, the link reads **Review customers** and opens the Customers list.
- [ ] Sending the storefront contact form raises New inquiries by 1; closing it on the Inquiries page lowers it again.
- [ ] Cancelling a test order removes it from the orders and sales.
- [ ] The low-stock table pages through all rows, and clicking a row opens the item.
- [ ] Settings → Locations & Shipping → India Warehouse: saving a Low-stock default changes the count, and rows show `(warehouse)`.
- [ ] A warehouse not linked to a sales channel says its stock isn't checked.
- [ ] On an item, the Low-stock alert box lists only selling warehouses that hold it. Saving a number shows **Low** when stock is at or below it, the Trends row shows `(item)`, and the page's Metadata section updates.
- [ ] Invalid values (`-1`, `2.5`) can't be saved.
- [ ] On an item, Locations → a row's **⋯** → **Edit**: saving a new stock number updates the Locations table, the Low-stock alert box's "left" number and its **Low** marker without a refresh. **Delete** on a row does too. Opening Trends straight after shows the new stock in the low-stock list.

## Running and deploying

- No new packages or migrations. The activity counts need the `inquiry` table, so
  run `pnpm medusa db:migrate` in `apps/backend` if it hasn't run since the Inquiry
  module was added.
- The Trends page and the two boxes are compiled into the backend build, so the
  live admin gets them only after the backend is rebuilt and redeployed.
- Warehouse defaults and item thresholds are data: set them in each environment's
  admin. Without them, every item uses 10.

## Known limitations

- **One currency.** Sales are in the store's default currency only. The note about
  orders in other currencies cannot be tested locally while no region uses another
  currency.
- **Totals add up in code.** Medusa's Query has no sums or grouping, so the trends
  route reads every order in the range. That is fine at this store's volume, but
  would need a different approach for a very large order history.
- **The page loads its numbers when it opens.** Changes made while it is open,
  for example in another tab, show after opening it again or refreshing it.
- **Every admin user sees sales figures.** Medusa's roles and permissions are not
  switched on.
