import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { isApproved } from '../../../../utils/is-approved';

// The store customer endpoint doesn't expose groups, so the storefront asks
// here whether the logged-in customer can see prices.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ approved: await isApproved(req) });
}
