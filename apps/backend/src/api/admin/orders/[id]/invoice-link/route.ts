import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils';
import { signInvoiceToken } from '../../../../../lib/invoice-token';
import { invoiceTokenSecret } from '../../../../utils/invoice-access';

// A short-lived link to the order's tax invoice on the storefront, the same
// page the buyer sees.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data } = await query.graph({
    entity: 'order',
    fields: ['id', 'shipping_address.country_code'],
    filters: { id },
  });
  if (!data[0]) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Order with id: ${id} was not found`,
    );
  }

  const storefrontUrl = process.env.STOREFRONT_URL || 'http://localhost:8000';
  const countryCode = data[0].shipping_address?.country_code || 'in';
  const token = signInvoiceToken(id, invoiceTokenSecret(req));

  res.json({
    url: `${storefrontUrl}/${countryCode}/invoice/${id}?token=${encodeURIComponent(token)}`,
  });
}
