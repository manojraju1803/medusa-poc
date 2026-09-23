import { HttpTypes } from "@medusajs/types"
import { Container } from "@modules/common/components/ui"
import Image from "next/image"
import ProductPlaceholder from "@modules/common/icons/product-placeholder"
import { isRealProductImageUrl } from "@lib/util/product-image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const realImages = images.filter((image) => isRealProductImageUrl(image.url))

  if (!realImages.length) {
    return (
      <div className="flex items-start relative">
        <div className="flex flex-col flex-1 small:mx-16">
          <Container className="relative aspect-square w-full overflow-hidden bg-ui-bg-subtle flex flex-col items-center justify-center gap-y-2 text-ui-fg-muted">
            <ProductPlaceholder size={56} />
            <span className="txt-compact-small">No image available</span>
          </Container>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start relative">
      <div className="flex flex-col flex-1 small:mx-16 gap-y-4">
        {realImages.map((image, index) => {
          return (
            <Container
              key={image.id}
              className="relative aspect-square w-full overflow-hidden bg-ui-bg-subtle"
              id={image.id}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  priority={index <= 2 ? true : false}
                  className="absolute inset-0 rounded-rounded"
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                  style={{
                    objectFit: "contain",
                  }}
                />
              )}
            </Container>
          )
        })}
      </div>
    </div>
  )
}

export default ImageGallery
