import {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from '@medusajs/framework/http';
import {
  ContainerRegistrationKeys,
  QueryContext,
} from '@medusajs/framework/utils';
import { isApproved } from '../../utils/is-approved';
import { StoreGetPriceTiersParams } from './middlewares';

type PriceTier = {
  from: number;
  // null means "and above"
  to: number | null;
  unit_amount: number;
};

type VariantPriceTiers = {
  variant_id: string;
  min_quantity: number;
  currency_code: string;
  tiers: PriceTier[];
};

// `calculated_price` is computed at query time from the pricing context, so the
// generated ProductVariant type doesn't declare it.
type PricedVariant = {
  id: string;
  calculated_price?: {
    calculated_amount?: number | string | null;
  } | null;
};

/**
 * The requesting customer's quantity slabs for every variant of the given
 * products.
 *
 * Prices are never computed here. The pricing engine is asked for this
 * customer's price at each quantity where some price could change, using the
 * same context the cart uses for a line item (currency, region, customer
 * groups, quantity), so the result always matches what the cart will charge.
 */
export async function GET(
  req: MedusaRequest<unknown, StoreGetPriceTiersParams>,
  res: MedusaResponse,
) {
  if (!(await isApproved(req))) {
    return res.json({ variants: [] });
  }

  const { product_id, region_id } = req.validatedQuery;
  const productIds = Array.isArray(product_id) ? product_id : [product_id];
  // `isApproved` passed, so the customer is authenticated.
  const customerId = (
    req as AuthenticatedMedusaRequest<unknown, StoreGetPriceTiersParams>
  ).auth_context.actor_id;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const [{ data: regions }, { data: customers }, { data: variants }] =
    await Promise.all([
      query.graph({
        entity: 'region',
        fields: ['id', 'currency_code'],
        filters: { id: region_id },
      }),
      query.graph({
        entity: 'customer',
        fields: ['id', 'groups.id'],
        filters: { id: customerId },
      }),
      query.graph({
        entity: 'product_variant',
        fields: ['id', 'metadata', 'price_set.id'],
        filters: { product_id: productIds },
      }),
    ]);

  const currencyCode = regions[0]?.currency_code;
  if (!currencyCode || !variants.length) {
    return res.json({ variants: [] });
  }

  const priceSetIds = variants
    .map((variant) => variant.price_set?.id)
    .filter((id): id is string => !!id);

  // Queried as prices, not as `price_set.prices`: the Pricing module loads a
  // price set's prices with `populateWhere: { prices: { price_list_id: null } }`,
  // which would hide every price-list slab.
  const { data: prices } = await query.graph({
    entity: 'price',
    fields: ['price_set_id', 'min_quantity', 'max_quantity'],
    filters: { price_set_id: priceSetIds, currency_code: currencyCode },
  });

  const pricesBySet = new Map<string, typeof prices>();
  for (const price of prices) {
    const list = pricesBySet.get(price.price_set_id) ?? [];
    list.push(price);
    pricesBySet.set(price.price_set_id, list);
  }

  const groupIds = (customers[0]?.groups ?? [])
    .map((group) => group?.id)
    .filter((id): id is string => !!id);

  // Quantities at which some price in this currency starts or stops applying,
  // starting from the variant's minimum order quantity.
  const breakpointsByVariant = new Map<string, number[]>();
  const minOrderByVariant = new Map<string, number>();

  for (const variant of variants) {
    const minOrder = Math.max(1, Number(variant.metadata?.min_quantity) || 1);
    const points = new Set<number>([minOrder]);

    for (const price of pricesBySet.get(variant.price_set?.id ?? '') ?? []) {
      if (price.min_quantity != null) {
        points.add(Number(price.min_quantity));
      }
      if (price.max_quantity != null) {
        points.add(Number(price.max_quantity) + 1);
      }
    }

    minOrderByVariant.set(variant.id, minOrder);
    breakpointsByVariant.set(
      variant.id,
      [...points].filter((q) => q >= minOrder).sort((a, b) => a - b),
    );
  }

  // One pricing call per distinct quantity, covering every variant at once.
  const quantities = [
    ...new Set([...breakpointsByVariant.values()].flat()),
  ].sort((a, b) => a - b);

  const priced = await Promise.all(
    quantities.map(async (quantity) => {
      const { data } = await query.graph({
        entity: 'product_variant',
        fields: ['id', 'calculated_price.calculated_amount'],
        filters: { product_id: productIds },
        context: {
          calculated_price: QueryContext({
            currency_code: currencyCode,
            region_id,
            customer: { groups: groupIds.map((id) => ({ id })) },
            quantity,
          }),
        },
      });

      const pricedVariants: PricedVariant[] = data;

      const amounts = new Map<string, number>();
      for (const variant of pricedVariants) {
        const amount = variant.calculated_price?.calculated_amount;
        if (amount != null) {
          amounts.set(variant.id, Number(amount));
        }
      }
      return [quantity, amounts] as const;
    }),
  );
  const amountAt = new Map(priced);

  const result: VariantPriceTiers[] = [];

  for (const [variantId, breakpoints] of breakpointsByVariant) {
    const tiers: PriceTier[] = [];

    breakpoints.forEach((from, index) => {
      const unitAmount = amountAt.get(from)?.get(variantId);
      if (unitAmount == null) {
        return;
      }

      const next = breakpoints[index + 1];
      const to = next != null ? next - 1 : null;
      const previous = tiers[tiers.length - 1];

      // Same price as the slab before it: extend that slab instead.
      if (previous && previous.unit_amount === unitAmount) {
        previous.to = to;
        return;
      }
      tiers.push({ from, to, unit_amount: unitAmount });
    });

    if (tiers.length) {
      result.push({
        variant_id: variantId,
        min_quantity: minOrderByVariant.get(variantId) ?? 1,
        currency_code: currencyCode,
        tiers,
      });
    }
  }

  return res.json({ variants: result });
}
