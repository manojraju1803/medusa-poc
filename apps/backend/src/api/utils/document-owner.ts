import { MedusaContainer } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { customerFolder, isInFolder, signupIdentityOf } from './document-files';

/**
 * The keys among `keys` that are really the customer's files, whatever their
 * metadata says: in their own folder, or in the signup folder of the login
 * (auth identity) that Medusa records as theirs (`app_metadata.customer_id`).
 *
 * Deleting a customer from the admin also deletes their login, so for a
 * deleted customer (`deleted: true`) a signup folder counts unless its login
 * now belongs to another customer.
 */
export async function ownDocumentKeys(
  container: MedusaContainer,
  customerId: string,
  keys: string[],
  { deleted = false } = {},
): Promise<string[]> {
  const identityIds = [
    ...new Set(keys.flatMap((key) => signupIdentityOf(key) ?? [])),
  ];
  const ownerOf = new Map<string, unknown>();
  if (identityIds.length) {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const { data: identities } = await query.graph({
      entity: 'auth_identity',
      fields: ['id', 'app_metadata'],
      filters: { id: identityIds },
    });
    for (const identity of identities) {
      ownerOf.set(identity.id, identity.app_metadata?.customer_id ?? null);
    }
  }

  return keys.filter((key) => {
    if (isInFolder(key, customerFolder(customerId))) return true;
    const identity = signupIdentityOf(key);
    if (!identity) return false;
    const owner = ownerOf.get(identity);
    return owner === customerId || (deleted && !owner);
  });
}
