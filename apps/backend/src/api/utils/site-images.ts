/**
 * Whether a stored file was uploaded through POST /admin/site-images (named
 * "site-…"; local storage adds a "<timestamp>-" before it, S3 a ULID after),
 * so cleaning up site images never deletes anything else, such as a product
 * image.
 */
export const isSiteImageKey = (key: string) =>
  /^(\d+-)?site-/.test(key.split('/').pop() ?? '');
