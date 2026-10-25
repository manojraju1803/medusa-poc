import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from '@medusajs/framework/http';
import { uploadFilesWorkflow } from '@medusajs/medusa/core-flows';
import { StorePostRegistrationDocuments } from './middlewares';

// Quality/compliance documents attached to a supplier registration. Uploaded
// through the stock file module; the storefront records the returned URLs on
// the registration inquiry for the team to review.
export async function POST(
  req: AuthenticatedMedusaRequest<StorePostRegistrationDocuments>,
  res: MedusaResponse,
) {
  const { files } = req.validatedBody;

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: files.map((f) => ({
        filename: f.filename,
        mimeType: f.mimeType,
        content: f.content,
        access: 'private' as const,
      })),
    },
  });

  res.status(201).json({
    files: result.map((file, i) => ({
      id: file.id,
      url: file.url,
      label: files[i].label,
      filename: files[i].filename,
    })),
  });
}
