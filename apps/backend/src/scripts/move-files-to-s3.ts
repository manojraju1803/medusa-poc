import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ExecArgs, MedusaContainer } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils';
import {
  deleteFilesWorkflow,
  updateCustomersWorkflow,
  updateProductsWorkflow,
  uploadFilesWorkflow,
} from '@medusajs/medusa/core-flows';
import { promises as fs } from 'fs';
import path from 'path';
import {
  customerFolder,
  CustomerDocument,
  documentFileName,
  mimeTypeOf,
} from '../api/utils/document-files';
import InquiryModuleService from '../modules/inquiry/service';
import { INQUIRY_MODULE } from '../modules/inquiry';
import { assertStorageMatchesDatabase } from './utils/assert-storage-matches-database';

/**
 * Moves files that were stored on the backend's disk (its `static` folder)
 * before storage moved to S3:
 *
 * - product images and thumbnails linked at <backend>/static/... are copied to
 *   the media bucket, and the product images point at the copies (same ids,
 *   same order). The local files are left in place.
 * - customers' documents saved with a public `url` are copied into
 *   documents/<customer_id>/ in the documents bucket, their entries get a
 *   `key`, and the local file is deleted, since `static` is public. Until then
 *   the profile and the admin list them without a View link. Supplier
 *   inquiries keep only the documents' names.
 *
 *   Documents stored by the old optional S3 setup aren't on disk: they're read
 *   from that bucket, named by S3_BUCKET (with S3_ACCESS_KEY_ID and
 *   S3_SECRET_ACCESS_KEY if its keys differ from the new ones), and left there.
 *   A file listed by more than one customer isn't moved for any of them.
 *
 * Images still linked from the old WooCommerce site aren't touched: run
 * watermark-product-images.ts for those, which uploads to S3 itself.
 *
 * Run from apps/backend, on the server that has the files, with that
 * environment's S3 settings, straight after deploying (it refuses to run with
 * the development buckets on a database that isn't local):
 *   pnpm medusa exec ./src/scripts/move-files-to-s3.ts
 * or, for some products' images only (documents and inquiries are skipped):
 *   pnpm medusa exec ./src/scripts/move-files-to-s3.ts prod_01... prod_02...
 * or for documents and inquiries only (images are skipped):
 *   pnpm medusa exec ./src/scripts/move-files-to-s3.ts documents
 * Safe to run again: anything already in S3 is skipped.
 */

const STATIC_DIR = path.join(process.cwd(), 'static');
const BATCH = 8;

// The local provider named files "<timestamp>-<name>"; S3 adds its own ULID.
const withoutLocalPrefix = (name: string) => name.replace(/^(private-)?\d+-/, '');

const localFileOf = (url: string) => {
  try {
    const { pathname } = new URL(url);
    if (!pathname.startsWith('/static/')) return null;
    return decodeURIComponent(pathname.slice('/static/'.length));
  } catch {
    return null;
  }
};

const IMAGE_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

export default async function moveFilesToS3({ container, args }: ExecArgs) {
  assertStorageMatchesDatabase('move-files-to-s3');
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  if (!process.env.S3_MEDIA_URL) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Set S3_MEDIA_URL first.');
  }

  const documentsOnly = args?.[0] === 'documents';
  const productIds = !documentsOnly && args?.length ? args : undefined;
  const images = documentsOnly
    ? { moved: 0, products: 0, failed: [] as string[] }
    : await moveProductImages(container, logger, productIds);
  const documents = productIds
    ? { moved: 0, customers: 0, failed: [] as string[] }
    : await moveCustomerDocuments(container, logger);
  const inquiries = productIds ? 0 : await stripInquiryLinks(container);

  logger.info(
    `Moved ${images.moved} image(s) on ${images.products} product(s)` +
      (images.failed.length ? `; ${images.failed.length} product(s) failed: ${images.failed.join(', ')}` : '') +
      `. Moved ${documents.moved} document(s) for ${documents.customers} customer(s)` +
      (documents.failed.length ? `; ${documents.failed.length} customer(s) failed: ${documents.failed.join(', ')}` : '') +
      `. Removed document links from ${inquiries} inquiry/inquiries. Run again to retry failures.`,
  );
}

async function moveProductImages(
  container: MedusaContainer,
  logger: { error: (message: string) => void },
  productIds?: string[],
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: 'product',
    fields: ['id', 'title', 'thumbnail', 'images.id', 'images.url', 'images.rank'],
    filters: productIds ? { id: productIds } : {},
  });

  const todo = data
    .map((product) => {
      const images = (product.images ?? [])
        .flatMap((image) => (image ? [image] : []))
        .sort((a, b) => a.rank - b.rank);
      const local = [
        ...new Set(
          [...images.map((image) => image.url), product.thumbnail].filter(
            (url): url is string => !!url && !!localFileOf(url),
          ),
        ),
      ];
      return { id: product.id, title: product.title, thumbnail: product.thumbnail, images, local };
    })
    .filter((product) => product.local.length);

  let moved = 0;
  const failed: string[] = [];
  for (let start = 0; start < todo.length; start += BATCH) {
    const results = await Promise.allSettled(
      todo.slice(start, start + BATCH).map(async (product) => {
        const files = await Promise.all(
          product.local.map(async (url) => {
            const name = localFileOf(url)!;
            return {
              filename: withoutLocalPrefix(name),
              mimeType: IMAGE_TYPES[path.extname(name).toLowerCase()] ?? 'application/octet-stream',
              content: (await fs.readFile(path.join(STATIC_DIR, name))).toString('base64'),
              access: 'public' as const,
            };
          }),
        );
        const { result: uploaded } = await uploadFilesWorkflow(container).run({
          input: { files },
        });
        const newUrl = new Map(product.local.map((url, i) => [url, uploaded[i].url]));
        try {
          await updateProductsWorkflow(container).run({
            input: {
              products: [
                {
                  id: product.id,
                  thumbnail: product.thumbnail
                    ? newUrl.get(product.thumbnail) ?? product.thumbnail
                    : product.thumbnail,
                  // All images, in order: the order sets their rank.
                  images: product.images.map((image) => ({
                    id: image.id,
                    url: newUrl.get(image.url) ?? image.url,
                  })),
                },
              ],
            },
          });
        } catch (error) {
          await deleteFilesWorkflow(container).run({
            input: { ids: uploaded.map((file) => file.id) },
          });
          throw error;
        }
        return product.local.length;
      }),
    );
    results.forEach((result, i) => {
      const product = todo[start + i];
      if (result.status === 'fulfilled') {
        moved += result.value;
      } else {
        failed.push(product.id);
        logger.error(`${product.id} (${product.title}): ${String(result.reason)}`);
      }
    });
  }
  return { moved, products: todo.length - failed.length, failed };
}

type LegacyDocument = Partial<CustomerDocument> & { url?: string; file_id?: string };

// Where an older document is: a file in `static`, or a key in the old bucket.
const legacySourceOf = (doc: LegacyDocument) => localFileOf(doc.url ?? '') ?? doc.file_id ?? '';

// The old optional S3 setup (S3_BUCKET) stored documents in its own bucket.
const oldBucket = () =>
  process.env.S3_BUCKET
    ? new S3Client({
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
        ...(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
          ? {
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
              },
            }
          : {}),
      })
    : null;

async function readLegacyDocument(doc: LegacyDocument, s3: S3Client | null) {
  const localName = localFileOf(doc.url ?? '');
  if (localName) {
    const localPath = path.resolve(STATIC_DIR, localName);
    if (!localPath.startsWith(STATIC_DIR + path.sep)) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, `"${doc.label}" points outside ${STATIC_DIR}.`);
    }
    try {
      return { name: localName, content: await fs.readFile(localPath), localPath };
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `"${doc.label}" isn't in ${STATIC_DIR} (${String(error)}). Run this on the server that has the backend's files.`,
      );
    }
  }
  if (doc.file_id && s3) {
    const { Body } = await s3.send(
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: doc.file_id }),
    );
    if (!Body) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `"${doc.label}" is empty in ${process.env.S3_BUCKET}.`);
    }
    return { name: doc.file_id, content: Buffer.from(await Body.transformToByteArray()) };
  }
  throw new MedusaError(
    MedusaError.Types.NOT_FOUND,
    `"${doc.label}" isn't on this server's disk (${doc.url ?? 'no link'}). ` +
      'If it was stored by the old S3 setup, set S3_BUCKET to that bucket and run again.',
  );
}

async function moveCustomerDocuments(
  container: MedusaContainer,
  logger: { error: (message: string) => void; info: (message: string) => void },
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({ entity: 'customer', fields: ['id', 'metadata'] });
  const documentsIn = (metadata: unknown) => {
    const documents = (metadata as Record<string, unknown> | null)?.documents;
    return (Array.isArray(documents) ? documents : []) as LegacyDocument[];
  };

  // Entries weren't checked before this release, so a file listed by two
  // customers may have been copied from someone else's entry.
  const listedBy = new Map<string, number>();
  for (const customer of data) {
    for (const doc of documentsIn(customer.metadata)) {
      const source = !doc.key && legacySourceOf(doc);
      if (source) listedBy.set(source, (listedBy.get(source) ?? 0) + 1);
    }
  }

  const s3 = oldBucket();
  let moved = 0;
  let customers = 0;
  let leftInOldBucket = 0;
  const failed: string[] = [];
  for (const customer of data) {
    const documents = documentsIn(customer.metadata);
    const legacy = documents.filter((doc) => !doc.key && (doc.file_id || doc.url));
    if (!legacy.length) continue;

    try {
      const shared = legacy.find((doc) => (listedBy.get(legacySourceOf(doc)) ?? 0) > 1);
      if (shared) {
        throw new MedusaError(
          MedusaError.Types.CONFLICT,
          `"${shared.label}" (${legacySourceOf(shared)}) is listed by more than one customer; check whose it is.`,
        );
      }

      const sources = await Promise.all(legacy.map((doc) => readLegacyDocument(doc, s3)));
      const { result: uploaded } = await uploadFilesWorkflow(container).run({
        input: {
          files: legacy.map((doc, i) => ({
            filename: documentFileName(customerFolder(customer.id), doc.label ?? 'document', sources[i].name),
            mimeType: mimeTypeOf(sources[i].name),
            content: sources[i].content.toString('base64'),
            access: 'private' as const,
          })),
        },
      });

      const position = new Map(legacy.map((doc, i) => [doc, i]));
      const next: CustomerDocument[] = documents.map((doc) => {
        const i = position.get(doc);
        return i === undefined
          ? (doc as CustomerDocument)
          : {
              label: doc.label ?? 'Document',
              filename: doc.filename ?? withoutLocalPrefix(path.basename(sources[i].name)),
              key: uploaded[i].id,
              uploaded_at: doc.uploaded_at,
            };
      });
      try {
        // Only `documents`: Medusa merges metadata keys, so other keys changed
        // meanwhile are kept.
        await updateCustomersWorkflow(container).run({
          input: { selector: { id: customer.id }, update: { metadata: { documents: next } } },
        });
      } catch (error) {
        await deleteFilesWorkflow(container).run({ input: { ids: uploaded.map((f) => f.id) } });
        throw error;
      }

      // `static` is public, so the old copies go once the new ones are saved.
      await Promise.all(
        sources.flatMap((source) =>
          source.localPath ? [fs.rm(source.localPath, { force: true })] : [],
        ),
      );
      leftInOldBucket += sources.filter((source) => !source.localPath).length;
      moved += legacy.length;
      customers += 1;
    } catch (error) {
      failed.push(customer.id);
      logger.error(`${customer.id}: ${String(error)}`);
    }
  }
  if (leftInOldBucket) {
    logger.info(
      `${leftInOldBucket} document(s) were copied from ${process.env.S3_BUCKET} and left there; ` +
        "delete them once you've checked the copies.",
    );
  }
  return { moved, customers, failed };
}

// Supplier inquiries kept public document links; keep only the names.
async function stripInquiryLinks(container: MedusaContainer) {
  const inquiryService: InquiryModuleService = container.resolve(INQUIRY_MODULE);
  const inquiries = await inquiryService.listInquiries({});
  const updates = inquiries.flatMap((inquiry) => {
    const metadata = (inquiry.metadata ?? {}) as Record<string, unknown>;
    const documents = Array.isArray(metadata.documents) ? (metadata.documents as LegacyDocument[]) : [];
    if (!documents.some((doc) => doc.url)) return [];
    return [
      {
        id: inquiry.id,
        metadata: {
          ...metadata,
          documents: documents.map(({ label, filename }) => ({ label, filename })),
        },
      },
    ];
  });
  if (updates.length) await inquiryService.updateInquiries(updates);
  return updates.length;
}
