/**
 * The homepage hero's three rotating slides. Each slide can have its own image
 * (uploaded through POST /admin/site-images, so it has no watermark) and alt
 * text; a slide without them uses the storefront's bundled default. Kept in
 * the store's metadata under `hero_slides`. Pure: the admin page imports it.
 */

export const HERO_SLIDES_KEY = 'hero_slides';
export const HERO_SLIDE_COUNT = 3;

export type HeroSlide = {
  image_url: string | null;
  // The stored file behind image_url, so a replaced image can be deleted.
  image_key: string | null;
  alt: string | null;
};

// The storefront's bundled images (apps/storefront/public, listed in
// src/modules/home/components/hero/slides.tsx), shown when a slide has none.
export const DEFAULT_HERO_IMAGES = ['/home-hero.jpg', '/home-hero-2.jpg', '/home-hero-3.jpg'];

const text = (value: unknown) => (typeof value === 'string' && value ? value : null);

/** The three slides from the store's metadata; missing ones are empty. */
export function readHeroSlides(metadata: Record<string, unknown> | null | undefined): HeroSlide[] {
  const stored = metadata?.[HERO_SLIDES_KEY];
  return Array.from({ length: HERO_SLIDE_COUNT }, (_, i) => {
    const slide = (Array.isArray(stored) ? stored[i] : null) as Partial<HeroSlide> | null;
    return {
      image_url: text(slide?.image_url),
      image_key: text(slide?.image_key),
      alt: text(slide?.alt),
    };
  });
}

/**
 * Whether a stored file was uploaded as a site image (named "site-…"), so
 * replacing a slide never deletes anything else, such as a product image.
 */
export const isSiteImageKey = (key: string) =>
  /^(\d+-)?site-/.test(key.split('/').pop() ?? '');
