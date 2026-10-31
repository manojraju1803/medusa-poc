import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils';
import { uploadFilesWorkflow } from '@medusajs/medusa/core-flows';
import path from 'path';
import { watermarkAndCompress } from '../../utils/watermark';
import { AdminPostSiteImages } from './middlewares';

/**
 * Uploads images for the site itself (hero slides, partner logos, blog
 * covers). Like a product upload, each image is turned upright and compressed
 * to at most 500 KB, and other formats are rejected, but it never gets the
 * logo: only POST /admin/uploads, which the product screens use, adds the
 * watermark.
 *
 * Stored publicly as "site-<name>", so site images are easy to tell apart.
 */
export async function POST(
  req: MedusaRequest<AdminPostSiteImages>,
  res: MedusaResponse,
) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
  const files: {
    filename: string;
    mimeType: string;
    content: string;
    access: 'public';
  }[] = [];

  // One at a time, like the product upload middleware, to keep memory down.
  for (const file of req.validatedBody.files) {
    const name = path.posix.basename(file.filename.replace(/\\/g, '/'));
    const { buffer, mimeType } = await watermarkAndCompress(
      Buffer.from(file.content, 'base64'),
      name,
      { addLogo: false },
    ).catch((error) => {
      if (error instanceof MedusaError) throw error;
      // The image library couldn't read it; keep its reason in the log.
      logger.warn(`Site image "${name}" couldn't be read: ${error}`);
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Can't upload "${name}": it couldn't be read as an image. Upload a JPEG, PNG or WebP image.`,
      );
    });
    files.push({
      filename: `site-${name}`,
      mimeType,
      content: buffer.toString('base64'),
      access: 'public',
    });
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({ input: { files } });
  res.status(201).json({ files: result.map((file) => ({ id: file.id, url: file.url })) });
}
