import React, { Suspense } from "react"

import { retrieveCustomer } from "@lib/data/customer"
import { listProducts } from "@lib/data/products"
import { wishlistOf } from "@lib/data/wishlist"
import { minQuantityOf } from "@lib/util/min-quantity"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import QuoteSampleForm from "@modules/inquiry/components/quote-sample-form"
import CompareToggle from "@modules/products/components/compare-toggle"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import RelatedProducts from "@modules/products/components/related-products"
import WishlistButton from "@modules/products/components/wishlist-button"
import { UNIT, forViewer, hsnOf, viewerFor } from "@modules/products/lib/access"
import { notFound } from "next/navigation"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate = async ({
  product: rawProduct,
  region,
  countryCode,
  images,
}: ProductTemplateProps) => {
  if (!rawProduct || !rawProduct.id) {
    return notFound()
  }

  const [customer, extras] = await Promise.all([
    retrieveCustomer(),
    listProducts({
      regionId: region.id,
      queryParams: {
        id: [rawProduct.id],
        fields:
          "id,collection.id,collection.title,collection.handle,collection.metadata,categories.id,categories.name,categories.handle,categories.parent_category_id",
      },
    }).then(({ response }) => response.products[0]),
  ])

  const viewer = viewerFor(customer, [rawProduct])
  const product = forViewer(rawProduct, viewer)
  const wishlist = await wishlistOf(customer)

  const brand = extras?.collection ?? rawProduct.collection
  const brandCountry =
    typeof brand?.metadata?.country === "string" ? brand.metadata.country : null
  const categories = extras?.categories ?? []
  // Most specific first: categories that have a parent.
  const primaryCategory =
    categories.find((c) => c.parent_category_id) ?? categories[0]
  const firstVariant = product.variants?.[0]
  const moq = minQuantityOf(firstVariant)
  const hsn = hsnOf(product)
  const stock =
    viewer === "approved" &&
    product.variants?.length === 1 &&
    firstVariant?.manage_inventory &&
    typeof firstVariant.inventory_quantity === "number"
      ? firstVariant.inventory_quantity
      : undefined

  const chips: [string, string][] = [
    ["MOQ", `${moq} ${UNIT}`],
    ...(hsn ? [["HSN", hsn] as [string, string]] : []),
    ...(primaryCategory ? [["Category", primaryCategory.name] as [string, string]] : []),
    ...(stock !== undefined
      ? [["Stock", stock > 0 ? `${stock.toLocaleString("en-IN")} ${UNIT}` : "Out of stock"] as [string, string]]
      : []),
  ]

  const customerName = [customer?.first_name, customer?.last_name]
    .filter(Boolean)
    .join(" ")

  return (
    <div className="bg-[#f7faf9] min-h-screen" data-testid="product-container">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <nav className="flex items-center gap-2 text-xs text-[#64748b] mb-5">
          <LocalizedClientLink href="/" className="hover:text-[#006B4F]">Home</LocalizedClientLink>
          <span>›</span>
          <LocalizedClientLink href="/store" className="hover:text-[#006B4F]">Ingredients</LocalizedClientLink>
          <span>›</span>
          <span className="text-[#0f172a] font-medium truncate">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] gap-6">
          <div className="self-start bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
            <ImageGallery images={images} title={product.title} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4" data-testid="spec-chips">
              {chips.map(([label, value]) => (
                <div key={label} className="bg-[#f8fffe] border border-[#e2f3eb] rounded-lg p-3">
                  <div className="text-[9px] uppercase tracking-wider text-[#64748b]">{label}</div>
                  <div className="text-xs font-bold text-[#0f172a] mt-1 break-words">{value}</div>
                </div>
              ))}
            </div>
            {product.description && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <h2 className="text-base font-extrabold text-[#0f172a]">Product Description</h2>
                <div
                  className="product-description text-sm text-[#475569] leading-relaxed mt-2"
                  data-testid="product-description"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>

          <div className="self-start bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] leading-tight"
                  data-testid="product-title"
                >
                  {product.title}
                </h1>
                {brand && (
                  <LocalizedClientLink
                    href={`/collections/${brand.handle}`}
                    className="inline-block text-sm font-semibold text-[#0757a8] mt-2 hover:text-[#006B4F]"
                  >
                    {brand.title}
                    {brandCountry ? ` · ${brandCountry}` : ""}
                  </LocalizedClientLink>
                )}
              </div>
              <WishlistButton
                productId={product.id}
                initialSaved={wishlist.includes(product.id)}
                isLoggedIn={!!customer}
                size="lg"
              />
            </div>

            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                  viewer={viewer}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} viewer={viewer} />
            </Suspense>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="#inquiry"
                className="py-2.5 text-center bg-[#0757a8] hover:bg-[#064985] text-white text-sm font-bold rounded-xl"
              >
                Request quote / sample
              </a>
              <CompareToggle productId={product.id} variant="button" />
            </div>
          </div>
        </div>

        <section
          id="inquiry"
          className="scroll-mt-24 bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm mt-6"
        >
          <h2 className="text-lg font-extrabold text-[#0f172a]">Request a quote or sample</h2>
          <p className="text-xs text-[#64748b] mt-0.5 mb-4">
            For {product.title}. Our sourcing team replies within 24–48 hours.
          </p>
          <QuoteSampleForm
            productId={product.id}
            variantId={firstVariant?.id}
            productTitle={product.title ?? "this product"}
            minQuantity={moq}
            defaults={{
              name: customerName || undefined,
              email: customer?.email,
              phone: customer?.phone ?? undefined,
              company: customer?.company_name ?? undefined,
            }}
          />
        </section>

        <Suspense fallback={null}>
          <RelatedProducts
            product={product}
            categoryIds={categories.map((c) => c.id)}
            countryCode={countryCode}
            viewer={viewer}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
