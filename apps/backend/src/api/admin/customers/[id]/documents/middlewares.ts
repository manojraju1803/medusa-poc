import {
  MiddlewareRoute,
  validateAndTransformBody,
} from '@medusajs/framework/http';
import { z } from '@medusajs/framework/zod';

// Same limits and names as supplier registration and My Profile.
export const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;

export const QUALITY_DOCUMENT_LABELS = [
  'Specification Sheet',
  'COA Form',
  'MSDS Form',
  'Non-GMO',
  'Melamine Free Certificate',
  'ISO 22000/HACCP Form',
  'Kosher Certificate',
  'Halal Certificate',
] as const;

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
] as const;

// One document at a time from the admin's customer profile. A document with
// the same label is replaced and its old file deleted.
export const AdminPostCustomerDocument = z.object({
  label: z.enum(QUALITY_DOCUMENT_LABELS),
  filename: z.string().trim().min(1).max(200),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  content: z
    .string()
    .base64()
    // Base64 is 4 bytes per 3; this bounds the decoded size.
    .max(Math.ceil(MAX_DOCUMENT_BYTES / 3) * 4),
});

export type AdminPostCustomerDocument = z.infer<typeof AdminPostCustomerDocument>;

export const adminCustomerDocumentMiddlewares: MiddlewareRoute[] = [
  {
    method: ['POST'],
    matcher: '/admin/customers/:id/documents',
    bodyParser: { sizeLimit: '4mb' },
    middlewares: [validateAndTransformBody(AdminPostCustomerDocument)],
  },
];
