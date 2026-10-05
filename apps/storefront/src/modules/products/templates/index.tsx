import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Divider from "@modules/common/components/divider"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <div className="bg-[#fcfdfd] min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-100 bg-[#f8fffe]">
        <div className="content-container py-3 text-xs text-[#6b7280] flex items-center gap-1.5 flex-wrap">
          <LocalizedClientLink href="/" className="hover:text-[#1C94D2]">
            Home
          </LocalizedClientLink>
          <span>/</span>
          <LocalizedClientLink href="/store" className="hover:text-[#1C94D2]">
            Product Catalog
          </LocalizedClientLink>
          {product.collection && (
            <>
              <span>/</span>
              <LocalizedClientLink
                href={`/collections/${product.collection.handle}`}
                className="hover:text-[#1C94D2]"
              >
                {product.collection.title}
              </LocalizedClientLink>
            </>
          )}
          <span>/</span>
          <span className="text-[#0f172a] font-semibold truncate max-w-[200px] sm:max-w-sm">
            {product.title}
          </span>
        </div>
      </div>

      {/* Main 2-Column Product Grid */}
      <div
        className="content-container grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 py-8 relative"
        data-testid="product-container"
      >
        {/* Left Column: Gallery, Detailed Description, and Technical Specifications (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-y-6">
          {/* Image Gallery */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs overflow-hidden">
            <ImageGallery images={images} />
          </div>

          {/* Product Overview & Structured Content from Description */}
          {product.description && (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                <span>📋</span>
                <span>Product Overview & Application Details</span>
              </h2>
              <div
                className="product-description text-sm text-[#374151] leading-relaxed"
                data-testid="product-description"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Technical Specifications & Compliance Accordion */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
            <h3 className="text-base font-bold text-[#0f172a] mb-4 flex items-center gap-2">
              <span>🔬</span>
              <span>Technical Specifications & Compliance</span>
            </h3>
            <ProductTabs product={product} />
          </div>
        </div>

        {/* Right Column: Sticky Commercial Buy Box (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-y-6 lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-sm flex flex-col gap-y-5">
            <ProductInfo product={product} />

            <Divider />

            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>

            {/* B2B Assurance Checklist */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5 text-xs text-[#374151]">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  ✓
                </span>
                <span>
                  <strong>Batch Tested CoA:</strong> Full assay & micro report with shipment
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  ✓
                </span>
                <span>
                  <strong>Direct Manufacturer Sourcing:</strong> 100% industrial traceability
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  ✓
                </span>
                <span>
                  <strong>Live WhatsApp Updates:</strong> Order packing, dispatch & tracking
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div
        className="content-container my-16"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
