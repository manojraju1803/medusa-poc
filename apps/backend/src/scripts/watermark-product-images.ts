import { ExecArgs, MedusaContainer } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils';
import {
  deleteFilesWorkflow,
  updateProductsWorkflow,
  uploadFilesWorkflow,
} from '@medusajs/medusa/core-flows';
import path from 'path';
import {
  isWatermarked,
  watermarkAndCompress,
  watermarkedFileName,
} from '../api/utils/watermark';
import { assertStorageMatchesDatabase } from './utils/assert-storage-matches-database';

/**
 * Burns the logo into every product image that doesn't have it yet.
 *
 * Run from apps/backend:
 *   pnpm medusa exec ./src/scripts/watermark-product-images.ts
 * or, for some products only:
 *   pnpm medusa exec ./src/scripts/watermark-product-images.ts prod_01... prod_02...
 *
 * For each image that isn't watermarked (such as the catalogue images still
 * linked from the old WooCommerce site), it downloads the image, adds the logo,
 * compresses it to at most 500 KB like an admin upload, uploads the copy to the
 * configured file storage, and points the product image at it. The image keeps its id, so variant images stay linked, and its
 * old link is kept in the image's `metadata.original_url`. The product's
 * thumbnail follows its image.
 *
 * Safe to run again: watermarked images are skipped, and a product that failed
 * is tried again. The copies go to the media bucket set in .env, so run it with
 * the settings of the environment whose products you're changing.
 */

// Products handled at once, to keep the load on the image host modest.
const CONCURRENCY = 4;
const DOWNLOAD_TIMEOUT_MS = 30_000;

type Product = {
  id: string;
  title: string;
  thumbnail: string | null;
  images: { id: string; url: string; rank: number; metadata: Record<string, unknown> | null }[];
};

export default async function watermarkProductImages({ container, args }: ExecArgs) {
  assertStorageMatchesDatabase('watermark-product-images');

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'thumbnail', 'images.id', 'images.url', 'images.rank', 'images.metadata'],
    filters: args?.length ? { id: args } : {},
  });
  const products: Product[] = data.map((product) => ({
    id: product.id,
    title: product.title,
    thumbnail: product.thumbnail ?? null,
    images: (product.images ?? [])
      .flatMap((image) => (image ? [image] : []))
      .map((image) => ({
        id: image.id,
        url: image.url,
        rank: image.rank,
        metadata: (image.metadata as Record<string, unknown> | null) ?? null,
      }))
      .sort((a, b) => a.rank - b.rank),
  }));

  const todo = products.filter((product) => urlsToWatermark(product).length);
  logger.info(
    `${todo.length} of ${products.length} products have images without the watermark.`,
  );

  let images = 0;
  const failed: string[] = [];
  for (let start = 0; start < todo.length; start += CONCURRENCY) {
    const batch = todo.slice(start, start + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map((product) => watermarkProduct(container, product)),
    );
    results.forEach((result, index) => {
      const product = batch[index];
      if (result.status === 'fulfilled') {
        images += result.value;
      } else {
        failed.push(product.id);
        logger.error(`${product.id} (${product.title}): ${String(result.reason)}`);
      }
    });
    logger.info(`Done ${Math.min(start + CONCURRENCY, todo.length)} of ${todo.length} products.`);
  }

  logger.info(
    `Watermarked ${images} images on ${todo.length - failed.length} products.` +
      (failed.length
        ? ` ${failed.length} products failed and were left as they were; run the script again to retry them.`
        : ''),
  );
}

/** The product's image and thumbnail links that don't have the watermark yet. */
function urlsToWatermark(product: Product): string[] {
  const urls = [...product.images.map((image) => image.url), product.thumbnail];
  return [
    ...new Set(urls.filter((url): url is string => !!url && !isWatermarked(url))),
  ];
}

/** Returns how many images were watermarked. */
async function watermarkProduct(
  container: MedusaContainer,
  product: Product,
): Promise<number> {
  const urls = urlsToWatermark(product);

  // Download and watermark everything first, so a bad image changes nothing.
  const files = await Promise.all(
    urls.map(async (url) => {
      const fileName = fileNameOf(url);
      const { buffer, mimeType } = await watermarkAndCompress(await download(url), fileName);
      return {
        filename: watermarkedFileName(fileName),
        mimeType,
        content: buffer.toString('base64'),
        access: 'public' as const,
      };
    }),
  );

  const { result: uploaded } = await uploadFilesWorkflow(container).run({
    input: { files },
  });
  const newUrl = new Map(urls.map((url, index) => [url, uploaded[index].url]));

  try {
    await updateProductsWorkflow(container).run({
      input: {
        products: [
          {
            id: product.id,
            thumbnail: product.thumbnail
              ? newUrl.get(product.thumbnail) ?? product.thumbnail
              : product.thumbnail,
            // All images, in their current order: the order sets their rank.
            images: product.images.map((image) => {
              const url = newUrl.get(image.url);
              return url
                ? {
                    id: image.id,
                    url,
                    metadata: { ...(image.metadata ?? {}), original_url: image.url },
                  }
                : { id: image.id, url: image.url };
            }),
          },
        ],
      },
    });
  } catch (error) {
    // Don't leave unused copies behind; the next run starts this product again.
    await deleteFilesWorkflow(container).run({
      input: { ids: uploaded.map((file) => file.id) },
    });
    throw error;
  }

  return urls.length;
}

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
  if (!response.ok) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Couldn't download ${url} (${response.status})`,
    );
  }
  return Buffer.from(await response.arrayBuffer());
}

/** The file name at the end of a URL, e.g. "quinoa-seeds.jpg". */
function fileNameOf(url: string): string {
  try {
    return decodeURIComponent(path.posix.basename(new URL(url).pathname)) || 'image';
  } catch {
    return 'image';
  }
}
