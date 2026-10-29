import { MedusaContainer } from '@medusajs/framework/types';
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from '@medusajs/framework/utils';
import { documentsOf, documentType } from './document-files';
import { ownDocumentKeys } from './document-owner';

/**
 * A short-lived link to one of a customer's documents, found by its type
 * ("coa-form"). Callers decide who may ask; this only checks that the stored
 * file really is the customer's (their folder, or their own signup folder), so
 * an edited metadata entry can't point at someone else's file.
 */
export async function documentDownloadUrl(
  container: MedusaContainer,
  customerId: string,
  type: string,
): Promise<string> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: customers } = await query.graph({
    entity: 'customer',
    fields: ['id', 'metadata'],
    filters: { id: customerId },
  });
  const document = documentsOf(customers[0]?.metadata).find(
    (doc) => documentType(doc.label) === type,
  );
  if (
    !document ||
    !(await ownDocumentKeys(container, customerId, [document.key])).length
  ) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Document not found.');
  }

  // A presigned link valid for 5 minutes (src/modules/s3-file).
  const { url } = await container.resolve(Modules.FILE).retrieveFile(document.key);
  return url;
}
