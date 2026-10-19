import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { INQUIRY_MODULE } from '../../../modules/inquiry';
import InquiryModuleService from '../../../modules/inquiry/service';

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const inquiryService: InquiryModuleService = req.scope.resolve(INQUIRY_MODULE);
  const { type, status } = req.query as { type?: string; status?: string };

  const filters: Record<string, unknown> = {};
  if (type) filters.type = type;
  if (status) filters.status = status;

  const [inquiries, count] = await (inquiryService as any).listAndCountInquiries(filters, {
    order: { created_at: 'DESC' },
  });

  res.json({ inquiries, count });
}
