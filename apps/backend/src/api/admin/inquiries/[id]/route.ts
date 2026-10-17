import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { INQUIRY_MODULE } from '../../../../modules/inquiry';
import InquiryModuleService from '../../../../modules/inquiry/service';
import { AdminPostInquiryStatus } from '../../demo-middlewares';

export async function POST(
  req: MedusaRequest<AdminPostInquiryStatus>,
  res: MedusaResponse,
) {
  const inquiryService: InquiryModuleService =
    req.scope.resolve(INQUIRY_MODULE);

  const inquiry = await inquiryService.updateInquiries({
    id: req.params.id,
    status: req.validatedBody.status,
  });

  res.json({ inquiry: { id: inquiry.id, status: inquiry.status } });
}
