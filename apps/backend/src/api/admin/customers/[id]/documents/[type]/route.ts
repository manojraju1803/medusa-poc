import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { documentDownloadUrl } from '../../../../../utils/document-download';

// Opens a customer's document from the admin: redirects to a link that works
// for 5 minutes. Medusa only lets signed-in admin users reach /admin routes.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const url = await documentDownloadUrl(req.scope, req.params.id, req.params.type);
  res.setHeader('Cache-Control', 'no-store');
  res.redirect(url);
}
