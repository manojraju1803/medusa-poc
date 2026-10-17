import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { INQUIRY_MODULE } from '../../../../modules/inquiry';
import InquiryModuleService from '../../../../modules/inquiry/service';

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const { status } = req.body as { status: string };

  const inquiryService: InquiryModuleService = req.scope.resolve(INQUIRY_MODULE);
  const [inquiry] = await (inquiryService as any).updateInquiries({ id, status });

  res.json({ inquiry });
}
