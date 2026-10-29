"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import Image from "next/image"
import ProductPlaceholder from "@modules/common/icons/product-placeholder"
import { isRealProductImageUrl } from "@lib/util/product-image"
import { useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  title?: string
}

const ImageGallery = ({ images, title }: ImageGalleryProps) => {
  const realImages = images.filter((image) => isRealProductImageUrl(image.url))
  const [active, setActive] = useState(0)
  const current = realImages[Math.min(active, realImages.length - 1)]

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-bold text-[#0f172a]">Product Gallery</h2>
          <p className="text-[10px] text-[#64748b]">Verified product imagery</p>
        </div>
        {realImages.length > 0 && (
          <span className="px-2.5 py-1 bg-[#f0fdf4] border border-[#dcfce7] text-[#166534] text-[10px] font-semibold rounded-full">
            {realImages.length} image{realImages.length > 1 ? "s" : ""} available
          </span>
        )}
      </div>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-gray-100 bg-white">
        {current?.url ? (
          <Image
            key={current.id}
            src={current.url}
            priority
            alt={title ?? "Product image"}
            fill
            sizes="(max-width: 1024px) 100vw, 640px"
            className="object-contain p-4"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-2 text-[#94a3b8] bg-[#f7faf9]">
            <ProductPlaceholder size={56} />
            <span className="text-xs">No image available</span>
          </div>
        )}
      </div>
      {realImages.length === 1 && (
        <div className="flex items-center gap-3 mt-3">
          <span className="relative w-20 h-14 shrink-0 rounded-lg overflow-hidden bg-white ring-2 ring-[#0757a8] ring-offset-2">
            <Image src={realImages[0].url!} alt="" fill sizes="80px" className="object-contain p-1" />
          </span>
          <p className="text-[10px] leading-relaxed text-[#64748b]">
            Only one verified image is available for this product. Additional images will appear here when supplied.
          </p>
        </div>
      )}
      {realImages.length > 1 && (
        <div className="flex items-center gap-3 mt-3 overflow-x-auto pb-1">
          {realImages.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={clx(
                "relative w-20 h-16 shrink-0 rounded-lg overflow-hidden border bg-white",
                i === active
                  ? "ring-2 ring-[#166534] ring-offset-2 border-transparent"
                  : "border-gray-200"
              )}
            >
              <Image
                src={image.url!}
                alt=""
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
