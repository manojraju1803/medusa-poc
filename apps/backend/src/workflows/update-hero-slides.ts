import { Modules } from '@medusajs/framework/utils';
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import {
  updateStoresWorkflow,
  useQueryGraphStep,
} from '@medusajs/medusa/core-flows';
import {
  HERO_SLIDES_KEY,
  HeroSlide,
  isSiteImageKey,
  readHeroSlides,
} from '../api/utils/hero-slides';

// Runs after the store is saved, so an image still in use is never deleted.
const deleteReplacedSiteImagesStep = createStep(
  'delete-replaced-site-images',
  async (keys: string[], { container }) => {
    if (keys.length) await container.resolve(Modules.FILE).deleteFiles(keys);
    return new StepResponse(keys.length);
  },
);

/**
 * Saves the homepage hero's three slides in the store's metadata, keeping the
 * store's other metadata, then deletes site images no slide uses any more.
 */
export const updateHeroSlidesWorkflow = createWorkflow(
  'update-hero-slides',
  (input: { slides: HeroSlide[] }) => {
    const { data: stores } = useQueryGraphStep({
      entity: 'store',
      fields: ['id', 'metadata'],
    });

    const change = transform({ stores, input }, ({ stores, input }) => {
      const metadata = (stores[0]?.metadata ?? {}) as Record<string, unknown>;
      const kept = new Set(input.slides.map((slide) => slide.image_key));
      return {
        storeId: stores[0].id as string,
        metadata: { ...metadata, [HERO_SLIDES_KEY]: input.slides },
        replacedKeys: readHeroSlides(metadata)
          .map((slide) => slide.image_key)
          .filter((key): key is string => !!key && !kept.has(key) && isSiteImageKey(key)),
      };
    });

    updateStoresWorkflow.runAsStep({
      input: { selector: { id: change.storeId }, update: { metadata: change.metadata } },
    });

    deleteReplacedSiteImagesStep(change.replacedKeys);

    return new WorkflowResponse(input.slides);
  },
);
