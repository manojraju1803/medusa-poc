import { MedusaContainer } from '@medusajs/framework/types';
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { deleteFilesWorkflow } from '@medusajs/medusa/core-flows';
import { customerFolder, documentsOf, isInFolder } from '../api/utils/document-files';
import { moveSignupDocumentsWorkflow } from '../workflows/move-signup-documents';

// A customer's documents follow the account:
// - created: documents uploaded at signup wait under
//   documents/pending/<auth identity>/ until the account exists, then move
//   into the customer's own folder. Anything left in pending/ (signups never
//   completed) is deleted by the bucket's 30-day lifecycle rule.
// - deleted: the customer's documents are deleted from the bucket. Medusa only
//   marks the customer as deleted, so its document list can still be read.
export default async function customerDocumentsHandler({
  event: { name, data },
  container,
}: SubscriberArgs<{ id: string }>) {
  if (name === 'customer.deleted') {
    await deleteCustomerDocuments(container, data.id);
    return;
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: customers } = await query.graph({
    entity: 'customer',
    fields: ['id', 'metadata'],
    filters: { id: data.id },
  });
  const pending = documentsOf(customers[0]?.metadata).filter((doc) =>
    doc.key.startsWith('documents/pending/'),
  );
  if (!pending.length) {
    return;
  }

  await moveSignupDocumentsWorkflow(container).run({
    input: { customerId: data.id },
  });
}

async function deleteCustomerDocuments(container: MedusaContainer, customerId: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: customers } = await query.graph({
    entity: 'customer',
    fields: ['id', 'metadata'],
    filters: { id: customerId },
    withDeleted: true,
  });
  // Only files in the customer's own folder, whatever the metadata says.
  const keys = documentsOf(customers[0]?.metadata)
    .map((doc) => doc.key)
    .filter((key) => isInFolder(key, customerFolder(customerId)));
  if (!keys.length) {
    return;
  }

  await deleteFilesWorkflow(container).run({ input: { ids: keys } });
  container
    .resolve(ContainerRegistrationKeys.LOGGER)
    .info(`Deleted ${keys.length} document(s) of deleted customer ${customerId}.`);
}

export const config: SubscriberConfig = {
  event: ['customer.created', 'customer.deleted'],
};
