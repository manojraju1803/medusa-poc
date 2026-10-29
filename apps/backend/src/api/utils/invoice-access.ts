import { MedusaRequest } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

// The storefront sends an admin-issued invoice token in this header.
export const INVOICE_TOKEN_HEADER = 'x-invoice-token';

export function invoiceTokenSecret(req: MedusaRequest): string {
  const config = req.scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE);
  return String(config.projectConfig.http.jwtSecret);
}
