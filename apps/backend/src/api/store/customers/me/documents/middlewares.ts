import {
  authenticate,
  MiddlewareRoute,
  validateAndTransformBody,
} from '@medusajs/framework/http';
import { z } from '@medusajs/framework/zod';
import { StorePostRegistrationDocuments } from '../../../registration-documents/middlewares';

// Same names as QUALITY_DOCUMENTS in the storefront's registration rules.
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

const Label = z.enum(QUALITY_DOCUMENT_LABELS);

export const StorePostMyDocuments = z
  .object({
    files: StorePostRegistrationDocuments.shape.files
      .element.extend({ label: Label })
      .array()
      .max(8)
      .default([]),
    remove: z.array(Label).max(8).default([]),
  })
  .refine((b) => b.files.length + b.remove.length > 0, {
    message: 'Nothing to change.',
  });

export type StorePostMyDocuments = z.infer<typeof StorePostMyDocuments>;

export const myDocumentsMiddlewares: MiddlewareRoute[] = [
  {
    method: ['POST'],
    matcher: '/store/customers/me/documents',
    // 8 files x 2 MB, base64-encoded, plus JSON overhead.
    bodyParser: { sizeLimit: '25mb' },
    middlewares: [
      authenticate('customer', ['session', 'bearer']),
      validateAndTransformBody(StorePostMyDocuments),
    ],
  },
];
