import {
  MiddlewareRoute,
  validateAndTransformBody,
} from '@medusajs/framework/http';
import { z } from '@medusajs/framework/zod';
import { HERO_SLIDE_COUNT } from '../../utils/hero-slides';

// The three slides, in order. An empty image or alt text means the
// storefront's default for that slide.
export const AdminPostHeroSlides = z.object({
  slides: z
    .array(
      z.object({
        image_url: z.url().nullable(),
        image_key: z.string().min(1).max(500).nullable(),
        alt: z.string().trim().max(200).nullable(),
      }),
    )
    .length(HERO_SLIDE_COUNT),
});

export type AdminPostHeroSlides = z.infer<typeof AdminPostHeroSlides>;

export const heroSlideMiddlewares: MiddlewareRoute[] = [
  {
    method: ['POST'],
    matcher: '/admin/hero-slides',
    middlewares: [validateAndTransformBody(AdminPostHeroSlides)],
  },
];
