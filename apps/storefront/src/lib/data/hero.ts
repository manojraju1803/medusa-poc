"use server"

import { sdk } from "@lib/config"

// A hero slide as set in the admin (Hero slides page). Nulls mean the
// slide's bundled default image or description.
export type HeroSlideContent = { image_url: string | null; alt: string | null }

/**
 * The homepage hero's slides from the backend. Not cached: saving a slide
 * deletes the image it replaced, so a cached copy could point at a missing
 * file. The homepage already renders per request (it checks the signed-in
 * customer), so this adds one small request. Returns [] when the backend
 * can't be reached, and the hero falls back to its bundled images.
 */
export const getHeroSlides = async (): Promise<HeroSlideContent[]> =>
  sdk.client
    .fetch<{ slides: HeroSlideContent[] }>("/store/hero-slides", {
      method: "GET",
      cache: "no-store",
    })
    .then(({ slides }) => slides)
    .catch(() => [])
