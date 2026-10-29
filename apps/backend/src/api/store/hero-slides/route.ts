import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { readHeroSlides } from '../../utils/hero-slides';

// The homepage hero's images and alt texts, for the storefront. A slide with
// nulls uses the storefront's bundled default.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data: stores } = await query.graph({ entity: 'store', fields: ['metadata'] });

  res.json({
    slides: readHeroSlides(stores[0]?.metadata).map(({ image_url, alt }) => ({
      image_url,
      alt,
    })),
  });
}
