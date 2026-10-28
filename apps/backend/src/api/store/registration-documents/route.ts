import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from '@medusajs/framework/http';
import { uploadFilesWorkflow } from '@medusajs/medusa/core-flows';
import { documentFileName, pendingFolder } from '../../utils/document-files';
import { StorePostRegistrationDocuments } from './middlewares';

// Quality/compliance documents attached to a supplier registration, uploaded
// before the customer exists. They're stored privately under the uploader's
// pending folder; when the account is created they're moved into the
// customer's own folder (src/subscribers/customer-documents.ts).
export async function POST(
  req: AuthenticatedMedusaRequest<StorePostRegistrationDocuments>,
  res: MedusaResponse,
) {
  const { files } = req.validatedBody;
  const folder = pendingFolder(req.auth_context.auth_identity_id);

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: files.map((f) => ({
        filename: documentFileName(folder, f.label, f.filename),
        mimeType: f.mimeType,
        content: f.content,
        access: 'private' as const,
      })),
    },
  });

  // The key, not a link: private files are only opened through the download
  // routes, which check who's asking.
  res.status(201).json({
    files: result.map((file, i) => ({
      key: file.id,
      label: files[i].label,
      filename: files[i].filename,
    })),
  });
}
