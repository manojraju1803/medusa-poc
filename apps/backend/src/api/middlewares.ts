import {
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from '@medusajs/framework/http';
import { MedusaError } from '@medusajs/framework/utils';
import { priceListSlabMiddlewares } from './admin/price-lists/middlewares';
import { approvalMiddlewares } from './store/customers/me/approval/middlewares';
import { adminDemoMiddlewares } from './admin/demo-middlewares';
import { uploadWatermarkMiddlewares } from './admin/uploads/middlewares';
import { siteImageMiddlewares } from './admin/site-images/middlewares';
import { monitoringMiddlewares } from './admin/monitoring/middlewares';
import { adminCustomerDocumentMiddlewares } from './admin/customers/[id]/documents/middlewares';
import { inquiryMiddlewares } from './store/inquiries/middlewares';
import { stockLevelMiddlewares } from './store/stock-levels/middlewares';
import { priceTierMiddlewares } from './store/price-tiers/middlewares';
import { locationMiddlewares } from './store/location/middlewares';
import { warehouseAvailabilityMiddlewares } from './store/warehouse-availability/middlewares';
import { filterProductsByWarehouse } from '../lib/warehouse-product-filter';
import { registrationDocumentMiddlewares } from './store/registration-documents/middlewares';
import { protectMetadataMiddlewares } from './store/customers/me/protect-metadata';
import { myDocumentsMiddlewares } from './store/customers/me/documents/middlewares';

import { customerDocumentDownloadMiddlewares } from './store/customers/[id]/documents/[type]/middlewares';

import { orderAccessMiddlewares } from './store/orders/middlewares';

import { isApproved } from './utils/is-approved';

async function requireApproved(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  if (await isApproved(req)) {
    return next();
  }
  next(
    new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      'Your account must be approved before you can use a cart.',
    ),
  );
}

// Raw price rows. No store client needs them: they carry base prices without a
// pricing context, so they would leak prices even to logged-out callers.
const RAW_PRICE_SEGMENTS = new Set(['prices', 'price_rules']);

// The sanctioned customer-facing price, resolved per customer.
const CALCULATED_PRICE_SEGMENT = 'calculated_price';

// Stock levels are shown to approved buyers only, like prices.
const STOCK_SEGMENT = 'inventory_quantity';

// "*variants.prices" and "variants.prices.amount" both yield a "prices" segment.
function fieldSegments(field: string): string[] {
  return field.replace(/^[*+-]+/, '').split('.');
}

async function hidePrices(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  const fields = req.queryConfig?.fields;
  if (!fields) {
    return next();
  }

  const withoutRawPrices = fields.filter(
    (field) => !fieldSegments(field).some((s) => RAW_PRICE_SEGMENTS.has(s)),
  );

  const isGated = (field: string) =>
    fieldSegments(field).some(
      (s) => s === CALCULATED_PRICE_SEGMENT || s === STOCK_SEGMENT,
    );

  req.queryConfig.fields =
    withoutRawPrices.some(isGated) && !(await isApproved(req))
      ? withoutRawPrices.filter((field) => !isGated(field))
      : withoutRawPrices;

  next();
}

export default defineMiddlewares({
  routes: [
    ...priceListSlabMiddlewares,
    ...priceTierMiddlewares,
    ...inquiryMiddlewares,
    ...registrationDocumentMiddlewares,
    ...protectMetadataMiddlewares,
    ...myDocumentsMiddlewares,

    ...customerDocumentDownloadMiddlewares,

    ...orderAccessMiddlewares,

    ...stockLevelMiddlewares,
    ...locationMiddlewares,
    ...warehouseAvailabilityMiddlewares,
    ...approvalMiddlewares,
    ...adminDemoMiddlewares,
    ...uploadWatermarkMiddlewares,
    ...siteImageMiddlewares,
    ...monitoringMiddlewares,
    ...adminCustomerDocumentMiddlewares,
    {
      method: ['GET'],
      matcher: '/store/products',
      // Both run on the core matcher on purpose: a warehouse-specific product
      // route of its own would not match `hidePrices`, and unapproved
      // customers would then see prices.
      middlewares: [filterProductsByWarehouse, hidePrices],
    },
    {
      method: ['GET'],
      matcher: '/store/products/:id',
      middlewares: [hidePrices],
    },
    {
      method: ['GET'],
      matcher: '/store/product-variants',
      middlewares: [hidePrices],
    },
    {
      method: ['GET'],
      matcher: '/store/product-variants/:id',
      middlewares: [hidePrices],
    },
    {
      method: ['GET'],
      matcher: '/store/product-categories',
      middlewares: [hidePrices],
    },
    {
      method: ['GET'],
      matcher: '/store/product-categories/:id',
      middlewares: [hidePrices],
    },
    {
      method: ['GET'],
      matcher: '/store/collections',
      middlewares: [hidePrices],
    },
    {
      method: ['GET'],
      matcher: '/store/collections/:id',
      middlewares: [hidePrices],
    },
    {
      method: ['POST'],
      matcher: '/store/carts',
      middlewares: [requireApproved],
    },
    {
      method: ['POST'],
      matcher: '/store/carts/:id/line-items',
      middlewares: [requireApproved],
    },
    {
      method: ['GET', 'POST'],
      matcher: '/store/carts/:id',
      middlewares: [requireApproved],
    },
    {
      method: ['POST', 'DELETE'],
      matcher: '/store/carts/:id/line-items/:line_id',
      middlewares: [requireApproved],
    },
    {
      method: ['POST'],
      matcher: '/store/carts/:id/complete',
      middlewares: [requireApproved],
    },
  ],
});
