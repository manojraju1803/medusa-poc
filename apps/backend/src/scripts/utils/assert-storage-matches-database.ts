import { MedusaError } from '@medusajs/framework/utils';

// Postgres on this machine, or the `postgres` service of docker-compose.yml.
const LOCAL_DATABASE = /@(localhost|127\.0\.0\.1|postgres)[:/]/;

/**
 * Stops a script that rewrites file links when the development buckets
 * (named `...-dev`) are set but the database isn't a local one: it would link
 * a shared or live database's products and documents to development storage.
 */
export function assertStorageMatchesDatabase(script: string) {
  const devBucket = [process.env.S3_MEDIA_BUCKET, process.env.S3_DOCUMENTS_BUCKET].some(
    (bucket) => /-dev$/.test(bucket ?? ''),
  );
  if (devBucket && !LOCAL_DATABASE.test(process.env.DATABASE_URL ?? '')) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `${script} would link a shared database's files to the development buckets. ` +
        `Run it with the S3 settings of the environment that owns this database.`,
    );
  }
}
