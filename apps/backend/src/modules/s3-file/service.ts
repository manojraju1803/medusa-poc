import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileTypes, Logger } from '@medusajs/framework/types';
import { AbstractFileProviderService, MedusaError } from '@medusajs/framework/utils';
import path from 'path';
import { PassThrough, Readable } from 'stream';
import { ulid } from 'ulid';

type Options = {
  region?: string;
  media_bucket?: string;
  // Public address of the media bucket, e.g.
  // https://<bucket>.s3.ap-south-1.amazonaws.com
  media_url?: string;
  documents_bucket?: string;
  // Only for S3-compatible services other than AWS.
  endpoint?: string;
};

// Each option and the setting in .env that fills it (see medusa-config.ts).
const REQUIRED_SETTINGS: [keyof Options, string][] = [
  ['region', 'S3_REGION'],
  ['media_bucket', 'S3_MEDIA_BUCKET'],
  ['media_url', 'S3_MEDIA_URL'],
  ['documents_bucket', 'S3_DOCUMENTS_BUCKET'],
];

// Keys that start with these live in the locked documents bucket; every other
// key is in the public media bucket. Customers' documents are under
// documents/<customer_id>/; other private files Medusa makes, such as product
// exports and import uploads, go under private/.
const DOCUMENTS_PREFIX = 'documents/';
const OTHER_PRIVATE_PREFIX = 'private/';

// How long a presigned download link works. Customers' documents get a short
// link; export links are opened from an admin notification, often later.
const DOCUMENT_LINK_SECONDS = 5 * 60;
const OTHER_PRIVATE_LINK_SECONDS = 60 * 60;
const UPLOAD_LINK_SECONDS = 60 * 60;

// The ULID this provider adds before the extension, e.g. "-01J8ZQ3K9TWN5X4VD2C7R6M1BA".
const ULID_SUFFIX = /-[0-9A-HJKMNP-TV-Z]{26}(?=\.[^.]*$|$)/;

const isPrivateKey = (key: string) =>
  key.startsWith(DOCUMENTS_PREFIX) || key.startsWith(OTHER_PRIVATE_PREFIX);

/** A posix path with no leading slash and no "." or ".." segments. */
function sanitizeFilePath(filePath: string): string {
  return path.posix
    .normalize(filePath.replace(/\\/g, '/').replace(/^\/+/, ''))
    .split('/')
    .filter((segment) => segment && segment !== '.' && segment !== '..')
    .join('/');
}

/** Same rule as Medusa's S3 provider: base64 unless the content is text. */
function decodeFileContent(content: string, mimeType?: string): Buffer {
  const decoded = Buffer.from(content, 'base64');
  if (decoded.toString('base64') === content) {
    return decoded;
  }
  const isText =
    mimeType?.startsWith('text/') ||
    mimeType?.includes('csv') ||
    mimeType?.includes('json') ||
    mimeType?.includes('xml');
  return Buffer.from(content, isText ? 'utf8' : 'binary');
}

/**
 * Stores uploaded files in two S3 buckets: public files (product and site
 * images) in a media bucket anyone can read, private files (customers'
 * documents, exports) in a documents bucket with all public access blocked,
 * opened only through short-lived presigned links.
 *
 * Medusa's File Module accepts exactly one provider, and its stock S3 provider
 * uses one bucket, so a separate private bucket needs a provider of our own.
 * Credentials come from AWS's standard lookup: `aws login` on a developer's
 * machine, the server's role or AWS_* variables in deployed environments.
 */
export default class S3FileProviderService extends AbstractFileProviderService {
  static identifier = 's3-two-bucket';

  protected readonly options_: Required<Omit<Options, 'endpoint'>> & Pick<Options, 'endpoint'>;
  protected readonly client_: S3Client;
  protected readonly logger_: Logger;

  // Fails at startup, so files can never quietly end up somewhere else.
  static validateOptions(options: Options) {
    const missing = REQUIRED_SETTINGS.filter(([option]) => !options?.[option]).map(
      ([, setting]) => setting,
    );
    if (missing.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `S3 file storage isn't configured: set ${missing.join(', ')} in apps/backend/.env. ` +
          'Uploaded files are only stored in S3; see docs/PRIVATE_DOCUMENTS.md.',
      );
    }
  }

  constructor({ logger }: { logger: Logger }, options: Options) {
    super();
    this.logger_ = logger;
    this.options_ = {
      region: options.region!,
      media_bucket: options.media_bucket!,
      media_url: options.media_url!.replace(/\/+$/, ''),
      documents_bucket: options.documents_bucket!,
      endpoint: options.endpoint,
    };
    this.client_ = new S3Client({
      region: this.options_.region,
      endpoint: this.options_.endpoint,
    });
  }

  private bucketFor(key: string) {
    return isPrivateKey(key) ? this.options_.documents_bucket : this.options_.media_bucket;
  }

  private urlFor(key: string) {
    const encoded = key.split('/').map(encodeURIComponent).join('/');
    // Only media links work for anyone. A documents-bucket link is returned
    // because Medusa expects one, but it is refused without a signature.
    return isPrivateKey(key)
      ? `https://${this.options_.documents_bucket}.s3.${this.options_.region}.amazonaws.com/${encoded}`
      : `${this.options_.media_url}/${encoded}`;
  }

  /**
   * The key for a new file: its path with a ULID before the extension, e.g.
   * documents/cus_1/coa-form.pdf -> documents/cus_1/coa-form-01J8….pdf.
   * Private files outside documents/ go under private/; a public file never
   * gets a private prefix.
   */
  private newKey(filename: string, access: FileTypes.FileAccessPermission, addUlid = true) {
    const clean = sanitizeFilePath(filename ?? '');
    if (!clean) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Invalid filename: ${filename}`);
    }
    const { dir, name, ext } = path.posix.parse(clean);
    const key = addUlid ? `${dir ? `${dir}/` : ''}${name}-${ulid()}${ext}` : clean;
    if (access === 'public') {
      return isPrivateKey(key) ? `media/${key}` : key;
    }
    return key.startsWith(DOCUMENTS_PREFIX) ? key : `${OTHER_PRIVATE_PREFIX}${key}`;
  }

  /** Headers for a stored file: cacheable for media, never cached for private ones. */
  private storageHeaders(key: string, mimeType?: string) {
    if (!isPrivateKey(key)) {
      return { ContentType: mimeType, CacheControl: 'public, max-age=31536000' };
    }
    // Downloads are named after the file without its ULID, e.g. "coa-form.pdf".
    const downloadName = path.posix.basename(key).replace(ULID_SUFFIX, '');
    return {
      ContentType: mimeType,
      CacheControl: 'private, no-store',
      ContentDisposition: `inline; filename="${downloadName.replace(/"/g, '')}"`,
    };
  }

  async upload(file: FileTypes.ProviderUploadFileDTO): Promise<FileTypes.ProviderFileResultDTO> {
    const key = this.newKey(file.filename, file.access ?? 'private');
    await this.client_.send(
      new PutObjectCommand({
        Bucket: this.bucketFor(key),
        Key: key,
        Body: decodeFileContent(file.content, file.mimeType),
        ...this.storageHeaders(key, file.mimeType),
      }),
    );
    return { key, url: this.urlFor(key) };
  }

  async getUploadStream(fileData: FileTypes.ProviderUploadStreamDTO) {
    const fileKey = this.newKey(fileData.filename, fileData.access ?? 'private');
    const writeStream = new PassThrough();
    const upload = new Upload({
      client: this.client_,
      params: {
        Bucket: this.bucketFor(fileKey),
        Key: fileKey,
        Body: writeStream,
        ...this.storageHeaders(fileKey, fileData.mimeType),
      },
    });
    const url = this.urlFor(fileKey);
    return {
      writeStream,
      promise: upload.done().then(() => ({ key: fileKey, url })),
      url,
      fileKey,
    };
  }

  // Used by the admin's product import, which uploads the CSV straight to S3.
  // The caller has already made the name unique, so no ULID is added.
  async getPresignedUploadUrl(
    fileData: FileTypes.ProviderGetPresignedUploadUrlDTO,
  ): Promise<FileTypes.ProviderFileResultDTO> {
    const key = this.newKey(fileData.filename, fileData.access ?? 'private', false);
    const url = await getSignedUrl(
      this.client_,
      new PutObjectCommand({
        Bucket: this.bucketFor(key),
        Key: key,
        ContentType: fileData.mimeType,
      }),
      { expiresIn: fileData.expiresIn ?? UPLOAD_LINK_SECONDS },
    );
    return { key, url };
  }

  async getPresignedDownloadUrl(fileData: FileTypes.ProviderGetFileDTO): Promise<string> {
    const key = fileData.fileKey;
    if (!isPrivateKey(key)) {
      return this.urlFor(key);
    }
    return getSignedUrl(
      this.client_,
      new GetObjectCommand({ Bucket: this.bucketFor(key), Key: key }),
      {
        expiresIn: key.startsWith(DOCUMENTS_PREFIX)
          ? DOCUMENT_LINK_SECONDS
          : OTHER_PRIVATE_LINK_SECONDS,
      },
    );
  }

  async getDownloadStream(fileData: FileTypes.ProviderGetFileDTO): Promise<Readable> {
    const response = await this.client_.send(
      new GetObjectCommand({ Bucket: this.bucketFor(fileData.fileKey), Key: fileData.fileKey }),
    );
    return response.Body as Readable;
  }

  async getAsBuffer(fileData: FileTypes.ProviderGetFileDTO): Promise<Buffer> {
    const response = await this.client_.send(
      new GetObjectCommand({ Bucket: this.bucketFor(fileData.fileKey), Key: fileData.fileKey }),
    );
    return Buffer.from(await response.Body!.transformToByteArray());
  }

  async delete(
    files: FileTypes.ProviderDeleteFileDTO | FileTypes.ProviderDeleteFileDTO[],
  ): Promise<void> {
    const keys = (Array.isArray(files) ? files : [files]).map((file) => file.fileKey);
    const byBucket = new Map<string, string[]>();
    for (const key of keys) {
      byBucket.set(this.bucketFor(key), [...(byBucket.get(this.bucketFor(key)) ?? []), key]);
    }
    // Like Medusa's own S3 provider, a failed delete is logged, not thrown: a
    // file left behind is better than undoing the change that replaced it.
    await Promise.all(
      [...byBucket].map(async ([bucket, bucketKeys]) => {
        try {
          await this.client_.send(
            new DeleteObjectsCommand({
              Bucket: bucket,
              Delete: { Objects: bucketKeys.map((Key) => ({ Key })), Quiet: true },
            }),
          );
        } catch (error) {
          this.logger_.error(`Couldn't delete ${bucketKeys.join(', ')} from ${bucket}: ${error}`);
        }
      }),
    );
  }
}
