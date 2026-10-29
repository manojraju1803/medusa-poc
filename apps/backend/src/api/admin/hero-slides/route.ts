import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { DEFAULT_HERO_IMAGES, readHeroSlides } from '../../utils/hero-slides';
import { updateHeroSlidesWorkflow } from '../../../workflows/update-hero-slides';
import { AdminPostHeroSlides } from './middlewares';

// The hero slides as saved, plus the storefront's default images so the admin
// page can show what a slide without its own image looks like.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data: stores } = await query.graph({ entity: 'store', fields: ['metadata'] });
  const storefront = (process.env.STOREFRONT_URL || 'http://localhost:8000').replace(/\/+$/, '');

  res.json({
    slides: readHeroSlides(stores[0]?.metadata),
    defaults: DEFAULT_HERO_IMAGES.map((image) => `${storefront}${image}`),
  });
}

export async function POST(req: MedusaRequest<AdminPostHeroSlides>, res: MedusaResponse) {
  const { result } = await updateHeroSlidesWorkflow(req.scope).run({
    input: {
      slides: req.validatedBody.slides.map((slide) => ({
        image_url: slide.image_url,
        image_key: slide.image_key,
        alt: slide.alt || null,
      })),
    },
  });
  res.json({ slides: result });
}
