import { Modules } from '@medusajs/framework/utils';
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import {
  updateCustomersWorkflow,
  useQueryGraphStep,
} from '@medusajs/medusa/core-flows';
import {
  customerFolder,
  CustomerDocument,
  documentFileName,
  documentsOf,
  mimeTypeOf,
} from '../api/utils/document-files';

const PENDING = 'documents/pending/';

type Moved = { documents: CustomerDocument[]; oldKeys: string[] };

// Copies each pending document into the customer's folder. Compensation
// deletes the copies, so a failed run leaves only the originals.
const copySignupDocumentsStep = createStep(
  'copy-signup-documents',
  async (
    { customerId, documents }: { customerId: string; documents: CustomerDocument[] },
    { container },
  ) => {
    const pending = documents.filter((doc) => doc.key.startsWith(PENDING));
    if (!pending.length) {
      return new StepResponse({ documents, oldKeys: [] } as Moved, [] as string[]);
    }

    const fileService = container.resolve(Modules.FILE);
    const copies = await fileService.createFiles(
      await Promise.all(
        pending.map(async (doc) => ({
          filename: documentFileName(customerFolder(customerId), doc.label, doc.key),
          mimeType: mimeTypeOf(doc.key),
          content: (await fileService.getAsBuffer(doc.key)).toString('base64'),
          access: 'private' as const,
        })),
      ),
    );

    const newKey = new Map(pending.map((doc, i) => [doc.key, copies[i].id]));
    return new StepResponse(
      {
        documents: documents.map((doc) =>
          newKey.has(doc.key) ? { ...doc, key: newKey.get(doc.key)! } : doc,
        ),
        oldKeys: pending.map((doc) => doc.key),
      } as Moved,
      copies.map((copy) => copy.id),
    );
  },
  async (copyKeys, { container }) => {
    if (copyKeys?.length) await container.resolve(Modules.FILE).deleteFiles(copyKeys);
  },
);

// Runs after the customer is saved, so the originals go only once nothing
// points at them.
const deletePendingDocumentsStep = createStep(
  'delete-pending-documents',
  async (keys: string[], { container }) => {
    if (keys.length) await container.resolve(Modules.FILE).deleteFiles(keys);
    return new StepResponse(keys.length);
  },
);

/**
 * Moves the documents a supplier uploaded at signup, stored under
 * documents/pending/<auth_identity_id>/ before the customer existed, into
 * documents/<customer_id>/ and points `metadata.documents` at the new keys.
 * Does nothing when there are no pending documents.
 */
export const moveSignupDocumentsWorkflow = createWorkflow(
  'move-signup-documents',
  (input: { customerId: string }) => {
    const { data: customers } = useQueryGraphStep({
      entity: 'customer',
      fields: ['id', 'metadata'],
      filters: { id: input.customerId },
      options: { throwIfKeyNotFound: true },
    });
    const current = transform({ customers }, ({ customers }) => ({
      metadata: (customers[0]?.metadata ?? {}) as Record<string, unknown>,
      documents: documentsOf(customers[0]?.metadata),
    }));

    const moved = copySignupDocumentsStep({
      customerId: input.customerId,
      documents: current.documents,
    });

    const metadata = transform({ current, moved }, ({ current, moved }) => ({
      ...current.metadata,
      documents: moved.documents,
    }));
    updateCustomersWorkflow.runAsStep({
      input: { selector: { id: input.customerId }, update: { metadata } },
    });

    const oldKeys = transform({ moved }, ({ moved }) => moved.oldKeys);
    deletePendingDocumentsStep(oldKeys);

    return new WorkflowResponse(moved.documents);
  },
);
