/**
 * Where customers' private documents are stored in the documents bucket, and
 * which documents a customer may open. Pure functions only: the admin's
 * profile page imports `documentType` too.
 *
 *   documents/<customer_id>/<document-type>-<ULID>.<ext>
 *       uploaded or replaced from the profile (supplier or admin)
 *   documents/signup/<auth_identity_id>/<document-type>-<ULID>.<ext>
 *       uploaded at signup, before the customer exists; they stay here
 *
 * The server always builds these paths from the signed-in identity, so a
 * document's folder says whose it is: a download is allowed when the stored
 * key is in the customer's folder or in their own login's signup folder
 * (src/api/utils/document-owner.ts).
 */

/** A document listed in `customer.metadata.documents`. */
export type CustomerDocument = {
  label: string;
  // The name the supplier's file had, shown on the profile.
  filename: string;
  // Where the file is in the documents bucket.
  key: string;
  uploaded_at?: string;
};

// The storage provider adds a ULID before the extension (src/modules/s3-file).
export const customerFolder = (customerId: string) => `documents/${customerId}/`;
const SIGNUP_FOLDER = 'documents/signup/';
export const signupFolder = (authIdentityId: string) =>
  `${SIGNUP_FOLDER}${authIdentityId}/`;

/** The login (auth identity) whose signup folder holds `key`, or null. */
export const signupIdentityOf = (key: string) => {
  if (!key.startsWith(SIGNUP_FOLDER)) return null;
  const [identity, file, ...rest] = key.slice(SIGNUP_FOLDER.length).split('/');
  return identity && file && !rest.length ? identity : null;
};

/** "ISO 22000/HACCP Form" -> "iso-22000-haccp-form": file names and download URLs. */
export const documentType = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const extensionOf = (filename: string) => {
  const match = /\.([a-z0-9]+)$/i.exec(filename);
  return match ? `.${match[1].toLowerCase()}` : '';
};

/** The name to upload a document under, e.g. documents/cus_1/coa-form.pdf. */
export const documentFileName = (folder: string, label: string, originalFilename: string) =>
  `${folder}${documentType(label)}${extensionOf(originalFilename)}`;

/** Whether a stored key is a file directly inside `folder`. */
export const isInFolder = (key: string, folder: string) =>
  key.startsWith(folder) && !key.slice(folder.length).includes('/');

/** A metadata entry that points at a stored file (old entries had only a public `url`). */
export const isStoredDocument = (value: unknown): value is CustomerDocument => {
  const doc = value as Partial<CustomerDocument> | null;
  return !!doc && typeof doc.label === 'string' && typeof doc.key === 'string';
};

/** The documents listed in a customer's metadata. */
export const documentsOf = (metadata: unknown): CustomerDocument[] => {
  const docs = (metadata as Record<string, unknown> | null)?.documents;
  return Array.isArray(docs) ? docs.filter(isStoredDocument) : [];
};

/**
 * A document as the profile and the admin list it. `key` is missing for one
 * saved before storage moved to S3 (it had a public `url`) until
 * src/scripts/move-files-to-s3.ts has secured it: it's listed, but can't be
 * opened yet.
 */
export type ListedDocument = Omit<CustomerDocument, 'key'> & { key?: string };

export const listedDocumentsOf = (metadata: unknown): ListedDocument[] => {
  const docs = (metadata as Record<string, unknown> | null)?.documents;
  return (Array.isArray(docs) ? docs : []).flatMap((doc) => {
    if (isStoredDocument(doc)) {
      const { label, filename, key, uploaded_at } = doc;
      return [{ label, filename, key, uploaded_at }];
    }
    const legacy = doc as { label?: unknown; filename?: unknown; url?: unknown; uploaded_at?: string } | null;
    return legacy && typeof legacy.label === 'string' && typeof legacy.url === 'string'
      ? [{
          label: legacy.label,
          filename: typeof legacy.filename === 'string' ? legacy.filename : legacy.label,
          uploaded_at: legacy.uploaded_at,
        }]
      : [];
  });
};

// What a stored document's type is, from its extension: used when the move
// script copies an older document into the customer's folder.
export const DOCUMENT_MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

export const mimeTypeOf = (key: string) =>
  DOCUMENT_MIME_TYPES[extensionOf(key)] ?? 'application/octet-stream';
