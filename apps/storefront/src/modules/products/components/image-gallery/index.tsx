"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import ProductPlaceholder from "@modules/common/icons/product-placeholder"
import { isRealProductImageUrl } from "@lib/util/product-image"
import React, { useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const realImages = images.filter((image) => isRealProductImageUrl(image.url))
  const [activeIdx, setActiveIdx] = useState(0)

  if (!realImages.length) {
    return (
      <div className="w-full aspect-square relative rounded-2xl bg-[#f8fafc] border border-gray-100 flex flex-col items-center justify-center gap-y-3 text-[#64748b]">
        <ProductPlaceholder size={64} />
        <span className="text-xs font-medium">No verified image uploaded yet</span>
      </div>
    )
  }

  const activeImage = realImages[activeIdx] || realImages[0]

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Feature Display */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center p-4 shadow-sm group">
        {!!activeImage.url && (
          <Image
            src={activeImage.url}
            priority={true}
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            alt="Product visual"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          />
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-gray-200 text-[10px] font-bold text-[#166534] shadow-xs">
          100% Authentic Lot
        </div>
      </div>

      {/* Multi-Image Thumbnails if > 1 */}
      {realImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {realImages.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setActiveIdx(index)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all bg-white p-1 ${
                activeIdx === index
                  ? "border-[#1C94D2] shadow-sm ring-2 ring-[#1C94D2]/20"
                  : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
              }`}
            >
              {image.url && (
                <Image
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-contain p-1"
                  sizes="80px"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
