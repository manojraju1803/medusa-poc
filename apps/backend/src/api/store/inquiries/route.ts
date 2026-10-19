import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from '@medusajs/framework/http';
import { INQUIRY_MODULE } from '../../../modules/inquiry';
import InquiryModuleService from '../../../modules/inquiry/service';
import { StorePostInquiry } from './middlewares';

export async function POST(
  req: AuthenticatedMedusaRequest<StorePostInquiry>,
  res: MedusaResponse,
) {
  const inquiryService: InquiryModuleService =
    req.scope.resolve(INQUIRY_MODULE);

  const inquiry = await inquiryService.createInquiries({
    ...req.validatedBody,
    customer_id: req.auth_context?.actor_id ?? null,
  });

  res.status(201).json({
    inquiry: {
      id: inquiry.id,
      type: inquiry.type,
      created_at: inquiry.created_at,
    },
  });
}
