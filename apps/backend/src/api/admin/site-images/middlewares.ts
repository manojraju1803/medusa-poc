import {
  MiddlewareRoute,
  validateAndTransformBody,
} from '@medusajs/framework/http';
import { z } from '@medusajs/framework/zod';

// Same limit as the admin's own upload box (admin.maxUploadFileSize in
// medusa-config.ts); images are compressed to at most 500 KB after this.
export const MAX_SITE_IMAGE_BYTES = 10 * 1024 * 1024;

export const AdminPostSiteImages = z.object({
  files: z
    .array(
      z.object({
        filename: z.string().trim().min(1).max(200),
        content: z
          .base64()
          // Base64 is 4 bytes per 3; this bounds the decoded size.
          .max(Math.ceil(MAX_SITE_IMAGE_BYTES / 3) * 4),
      }),
    )
    .min(1)
    .max(3),
});

export type AdminPostSiteImages = z.infer<typeof AdminPostSiteImages>;

export const siteImageMiddlewares: MiddlewareRoute[] = [
  {
    method: ['POST'],
    matcher: '/admin/site-images',
    // 3 images of up to 10 MB, base64-encoded, plus JSON overhead.
    bodyParser: { sizeLimit: '45mb' },
    middlewares: [validateAndTransformBody(AdminPostSiteImages)],
  },
];
