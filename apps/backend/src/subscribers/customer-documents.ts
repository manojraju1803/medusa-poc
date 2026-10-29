import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { deleteFilesWorkflow } from '@medusajs/medusa/core-flows';
import { documentsOf } from '../api/utils/document-files';
import { ownDocumentKeys } from '../api/utils/document-owner';

// A deleted customer's documents are deleted from the bucket: those in their
// own folder and those still in their signup folder. Medusa only marks the
// customer as deleted, so its document list can still be read.
export default async function customerDocumentsHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: customers } = await query.graph({
    entity: 'customer',
    fields: ['id', 'metadata'],
    filters: { id: data.id },
    withDeleted: true,
  });
  // Only the customer's own files, whatever the metadata says.
  const keys = await ownDocumentKeys(
    container,
    data.id,
    documentsOf(customers[0]?.metadata).map((doc) => doc.key),
    { deleted: true },
  );
  if (!keys.length) {
    return;
  }

  await deleteFilesWorkflow(container).run({ input: { ids: keys } });
  container
    .resolve(ContainerRegistrationKeys.LOGGER)
    .info(`Deleted ${keys.length} document(s) of deleted customer ${data.id}.`);
}

export const config: SubscriberConfig = {
  event: 'customer.deleted',
};
