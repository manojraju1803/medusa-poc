import { MedusaError, Modules } from '@medusajs/framework/utils';
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

export type CustomerDocument = {
  label: string;
  filename: string;
  url: string;
  file_id?: string;
  uploaded_at?: string;
};

type IncomingFile = {
  label: string;
  filename: string;
  mimeType: string;
  content: string;
};

export type UpdateCustomerDocumentsInput = {
  customerId: string;
  files: IncomingFile[];
  remove: string[];
};

const uploadDocumentFilesStep = createStep(
  'upload-customer-document-files',
  async (files: IncomingFile[], { container }) => {
    if (!files.length) return new StepResponse([] as CustomerDocument[], []);
    const fileService = container.resolve(Modules.FILE);
    const created = await fileService.createFiles(
      files.map((f) => ({
        filename: f.filename,
        mimeType: f.mimeType,
        content: f.content,
        access: 'private' as const,
      })),
    );
    const uploadedAt = new Date().toISOString();
    const documents: CustomerDocument[] = created.map((file, i) => ({
      label: files[i].label,
      filename: files[i].filename,
      url: file.url,
      file_id: file.id,
      uploaded_at: uploadedAt,
    }));
    return new StepResponse(
      documents,
      created.map((f) => f.id),
    );
  },
  async (fileIds, { container }) => {
    if (!fileIds?.length) return;
    await container.resolve(Modules.FILE).deleteFiles(fileIds);
  },
);

// Runs after the customer is updated, so a failed update never deletes a file
// that is still referenced. Old files from before `file_id` was stored are
// left alone.
const deleteReplacedFilesStep = createStep(
  'delete-replaced-customer-document-files',
  async (fileIds: string[], { container }) => {
    if (fileIds.length) await container.resolve(Modules.FILE).deleteFiles(fileIds);
    return new StepResponse(fileIds.length);
  },
);

// Only suppliers keep quality documents on their account.
const assertSupplierStep = createStep(
  'assert-customer-is-supplier',
  async (metadata: Record<string, unknown> | null | undefined) => {
    if (metadata?.account_type !== 'supplier') {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        'Only supplier accounts can manage quality documents.',
      );
    }
    return new StepResponse(true);
  },
);

// Adds, replaces (same label) or removes the quality documents listed in a
// supplier's `customer.metadata.documents`. Uploaded files that a failed run
// leaves behind are deleted by compensation.
export const updateCustomerDocumentsWorkflow = createWorkflow(
  'update-customer-documents',
  (input: UpdateCustomerDocumentsInput) => {
    const { data: customers } = useQueryGraphStep({
      entity: 'customer',
      fields: ['id', 'metadata'],
      filters: { id: input.customerId },
      options: { throwIfKeyNotFound: true },
    });
    const currentMetadata = transform(
      { customers },
      ({ customers }) => (customers[0]?.metadata ?? {}) as Record<string, unknown>,
    );
    assertSupplierStep(currentMetadata);

    const uploaded = uploadDocumentFilesStep(input.files);

    const metadata = transform(
      { currentMetadata, uploaded, input },
      ({ currentMetadata, uploaded, input }) => {
        const existing = Array.isArray(currentMetadata.documents)
          ? (currentMetadata.documents as CustomerDocument[])
          : [];
        const replaced = new Set([
          ...input.remove,
          ...uploaded.map((d) => d.label),
        ]);
        return {
          ...currentMetadata,
          documents: [
            ...existing.filter((d) => !replaced.has(d.label)),
            ...uploaded,
          ],
        };
      },
    );

    updateCustomersWorkflow.runAsStep({
      input: {
        selector: { id: input.customerId },
        update: { metadata },
      },
    });

    const obsoleteFileIds = transform(
      { currentMetadata, uploaded, input },
      ({ currentMetadata, uploaded, input }) => {
        const replaced = new Set([...input.remove, ...uploaded.map((d) => d.label)]);
        const existing = Array.isArray(currentMetadata.documents)
          ? (currentMetadata.documents as CustomerDocument[])
          : [];
        return existing
          .filter((d) => replaced.has(d.label) && d.file_id)
          .map((d) => d.file_id as string);
      },
    );
    deleteReplacedFilesStep(obsoleteFileIds);

    const documents = transform(
      { metadata },
      ({ metadata }) => metadata.documents as CustomerDocument[],
    );
    return new WorkflowResponse(documents);
  },
);
