import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
  MiddlewareRoute,
} from '@medusajs/framework/http';
import {
  isWatermarked,
  watermarkAndCompress,
  watermarkedFileName,
} from '../../utils/watermark';

// The parts of a file that Medusa's upload middleware (multer) reads into the
// request and its upload route then stores.
type UploadedFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

/**
 * Burns the logo into every image uploaded through the admin, and compresses
 * it to at most 500 KB: the product media editor and the product create form
 * both upload here.
 *
 * Runs after Medusa has read the files into memory and before its route stores
 * them, so whichever file storage is configured (local now, S3 later) only ever
 * receives the finished file. Other files, such as CSVs, pass untouched. An
 * image that can't be watermarked or brought under the limit is rejected, and
 * nothing in the upload is stored.
 */
async function watermarkUploads(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  try {
    const files = (req as MedusaRequest & { files?: UploadedFile[] }).files ?? [];
    for (const file of files) {
      if (!file.mimetype.startsWith('image/')) {
        continue;
      }
      // A file that already has the logo is still compressed and size-checked.
      const hasLogo = isWatermarked(file.originalname);
      const { buffer, mimeType } = await watermarkAndCompress(
        file.buffer,
        file.originalname,
        { addLogo: !hasLogo },
      );
      file.buffer = buffer;
      file.size = buffer.length;
      file.mimetype = mimeType;
      if (!hasLogo) {
        file.originalname = watermarkedFileName(file.originalname);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}

export const uploadWatermarkMiddlewares: MiddlewareRoute[] = [
  {
    method: ['POST'],
    matcher: '/admin/uploads',
    middlewares: [watermarkUploads],
  },
];
