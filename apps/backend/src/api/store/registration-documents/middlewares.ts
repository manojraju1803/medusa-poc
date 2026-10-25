import {
  authenticate,
  MiddlewareRoute,
  validateAndTransformBody,
} from '@medusajs/framework/http';
import { z } from '@medusajs/framework/zod';

export const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

export const StorePostRegistrationDocuments = z.object({
  files: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(100),
        filename: z.string().trim().min(1).max(200),
        mimeType: z.enum(ALLOWED_MIME_TYPES as [string, ...string[]]),
        content: z
          .string()
          .base64()
          // Base64 is 4 bytes per 3; this bounds the decoded size.
          .max(Math.ceil(MAX_DOCUMENT_BYTES / 3) * 4),
      }),
    )
    .min(1)
    .max(8),
});

export type StorePostRegistrationDocuments = z.infer<
  typeof StorePostRegistrationDocuments
>;

export const registrationDocumentMiddlewares: MiddlewareRoute[] = [
  {
    method: ['POST'],
    matcher: '/store/registration-documents',
    // 8 files x 2 MB, base64-encoded, plus JSON overhead.
    bodyParser: { sizeLimit: '25mb' },
    middlewares: [
      // Only someone who has just registered an auth identity (no customer
      // record yet) or a signed-in customer can upload.
      authenticate('customer', ['bearer'], { allowUnregistered: true }),
      validateAndTransformBody(StorePostRegistrationDocuments),
    ],
  },
];
