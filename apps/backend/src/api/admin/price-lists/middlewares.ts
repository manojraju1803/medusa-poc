/**
 * Lets the admin's built-in price-list editor show and save quantity slabs.
 *
 * The dashboard (as of Medusa 2.20.1) keeps a slab's quantity range in the
 * price's rules: it only lists a price as a tier when `rules.min_quantity` or
 * `rules.max_quantity` is set, and its tier editor saves ranges that way. The
 * pricing engine ignores those rules and only matches the price's own
 * `min_quantity` / `max_quantity`, so a slab saved as rules is never charged.
 *
 * These middlewares translate at the API boundary:
 * - saving: a range sent in `rules` is moved into `min_quantity` /
 *   `max_quantity`, so ranges are only ever stored there;
 * - loading: a price's `min_quantity` / `max_quantity` is also returned as
 *   `rules`, so the dashboard recognises it as a tier. Nothing is saved as rules.
 *
 * Remove this file once the dashboard reads and writes `min_quantity` /
 * `max_quantity` itself. After each Medusa upgrade, check `initRecord` and
 * `buildPriceRules` in the dashboard's `src/routes/price-lists/common/utils.ts`.
 */
import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
  MiddlewareRoute,
} from '@medusajs/framework/http';
import { HttpTypes } from '@medusajs/framework/types';
import {
  ContainerRegistrationKeys,
  MedusaError,
} from '@medusajs/framework/utils';

type PriceInput = {
  rules?: Record<string, string>;
  min_quantity?: number | null;
  max_quantity?: number | null;
};

type PriceOutput = {
  rules?: Record<string, unknown>;
  min_quantity?: number | null;
  max_quantity?: number | null;
};

type DeletedPrice = {
  id: string;
  currency_code: string;
  min_quantity?: number | null;
  max_quantity?: number | null;
  price_set?: { variant?: { id: string } | null } | null;
  price_rules?: ({ attribute: string; value: string } | null)[] | null;
};

function toQuantity(value: string | undefined): number | null {
  if (value === undefined || value === '') {
    return null;
  }

  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Quantity ranges must be whole numbers, got "${value}".`,
    );
  }
  return quantity;
}

// Saving: a range sent as rules moves into the price's own columns. Prices sent
// without a range, such as plain-cell edits, are left as they are.
function moveRangeToColumns<T extends PriceInput>(price: T): T {
  const { min_quantity, max_quantity, ...otherRules } = price.rules ?? {};
  if (min_quantity === undefined && max_quantity === undefined) {
    return price;
  }

  return {
    ...price,
    min_quantity: toQuantity(min_quantity),
    max_quantity: toQuantity(max_quantity),
    // On an update this replaces the price's rules, so a range left behind
    // as rules by an older save is removed.
    rules: otherRules,
  };
}

// Loading: the range is also shown as rules, where the dashboard looks for it.
function showRangeAsRules<T extends PriceOutput>(price: T): T {
  if (
    !price.rules ||
    (price.min_quantity == null && price.max_quantity == null)
  ) {
    return price;
  }

  return {
    ...price,
    rules: {
      ...price.rules,
      ...(price.min_quantity != null && {
        min_quantity: String(price.min_quantity),
      }),
      ...(price.max_quantity != null && {
        max_quantity: String(price.max_quantity),
      }),
    },
  };
}

// A slab is one variant's price in one currency and region, for one range.
function slabKey(
  variantId: string | undefined,
  currencyCode: string | undefined,
  regionId: string | undefined,
  min: number | null | undefined,
  max: number | null | undefined,
) {
  return [
    variantId,
    currencyCode,
    regionId ?? '',
    min == null ? '' : Number(min),
    max == null ? '' : Number(max),
  ].join('|');
}

// Deleting a slab and adding one with the same range in a single batch loses
// both: the new price is matched to the one being deleted, which is then
// removed. That happens when a tier row is removed and re-added in the editor
// before saving, so such a pair is sent as an update of the existing price.
async function keepReAddedSlabs(
  req: MedusaRequest,
  body: HttpTypes.AdminBatchPriceListPrice,
) {
  if (!body.delete?.length || !body.create?.length) {
    return;
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: 'price',
    fields: [
      'id',
      'currency_code',
      'min_quantity',
      'max_quantity',
      'price_set.variant.id',
      'price_rules.attribute',
      'price_rules.value',
    ],
    filters: { id: body.delete },
  });
  const deleted: DeletedPrice[] = data;

  const deletedIdBySlab = new Map(
    deleted.map((price) => [
      slabKey(
        price.price_set?.variant?.id,
        price.currency_code,
        price.price_rules?.find((rule) => rule?.attribute === 'region_id')
          ?.value,
        price.min_quantity,
        price.max_quantity,
      ),
      price.id,
    ]),
  );

  const create: HttpTypes.AdminCreatePriceListPrice[] = [];
  for (const price of body.create) {
    const key = slabKey(
      price.variant_id,
      price.currency_code,
      price.rules?.region_id,
      price.min_quantity,
      price.max_quantity,
    );
    const id = deletedIdBySlab.get(key);

    if (!id) {
      create.push(price);
      continue;
    }
    deletedIdBySlab.delete(key);
    body.delete = body.delete.filter((deletedId) => deletedId !== id);
    body.update = [...(body.update ?? []), { ...price, id }];
  }
  body.create = create;
}

function moveRangesOnCreate(
  req: MedusaRequest<HttpTypes.AdminCreatePriceList>,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  try {
    const body = req.validatedBody;
    body.prices = body.prices?.map(moveRangeToColumns);
    next();
  } catch (error) {
    next(error);
  }
}

async function moveRangesOnBatch(
  req: MedusaRequest<HttpTypes.AdminBatchPriceListPrice>,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  try {
    const body = req.validatedBody;
    body.create = body.create?.map(moveRangeToColumns);
    body.update = body.update?.map(moveRangeToColumns);
    await keepReAddedSlabs(req, body);
    next();
  } catch (error) {
    next(error);
  }
}

function showRangesOnRetrieve(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  const json = res.json.bind(res);

  res.json = ((body: { price_list?: { prices?: PriceOutput[] } }) => {
    const priceList = body?.price_list;
    if (!priceList?.prices) {
      return json(body);
    }
    return json({
      ...body,
      price_list: { ...priceList, prices: priceList.prices.map(showRangeAsRules) },
    });
  }) as MedusaResponse['json'];

  next();
}

export const priceListSlabMiddlewares: MiddlewareRoute[] = [
  {
    method: ['POST'],
    matcher: '/admin/price-lists',
    middlewares: [moveRangesOnCreate],
  },
  {
    method: ['POST'],
    matcher: '/admin/price-lists/:id/prices/batch',
    middlewares: [moveRangesOnBatch],
  },
  {
    method: ['GET'],
    matcher: '/admin/price-lists/:id',
    middlewares: [showRangesOnRetrieve],
  },
];
