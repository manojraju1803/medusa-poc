import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { isSiteImageKey } from '../../api/utils/site-images';

export type DeleteReplacedSiteImagesInput = {
  // File keys (the `id` POST /admin/site-images returns), not URLs, of the site
  // images in use before the save and after it. `current` must cover every
  // place a site image is used, not only the section being saved. Empty slots
  // can be null.
  previous: (string | null | undefined)[];
  current: (string | null | undefined)[];
};

/**
 * Deletes the site images a save stopped using. Run it after the step that
 * saves: a key still in `current` is never deleted, and only "site-…" files
 * are, so a product image used on the page is safe.
 *
 * Best-effort: a failed delete is logged and the file is left behind, instead
 * of failing the workflow and rolling back the save, as the stock
 * deleteFilesStep would.
 */
export const deleteReplacedSiteImagesStep = createStep(
  'delete-replaced-site-images',
  async ({ previous, current }: DeleteReplacedSiteImagesInput, { container }) => {
    const kept = new Set(current);
    const keys = [...new Set(previous)].filter(
      (key): key is string =>
        // A URL isn't a key; deleting by it would silently do nothing.
        !!key && !key.includes('://') && !kept.has(key) && isSiteImageKey(key),
    );
    if (!keys.length) {
      return new StepResponse([] as string[]);
    }
    try {
      await container.resolve(Modules.FILE).deleteFiles(keys);
    } catch (error) {
      container
        .resolve(ContainerRegistrationKeys.LOGGER)
        .warn(`Couldn't delete replaced site images (${keys.join(', ')}): ${error}`);
      return new StepResponse([] as string[]);
    }
    return new StepResponse(keys);
  },
);
