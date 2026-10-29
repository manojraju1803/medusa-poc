import { safeDescriptionHtml } from "@lib/util/description-html"
import React, { Suspense } from "react"

import { retrieveCustomer } from "@lib/data/customer"
import { listProducts } from "@lib/data/products"
import { wishlistOf } from "@lib/data/wishlist"
import { minQuantityOf } from "@lib/util/min-quantity"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import QuoteSampleForm from "@modules/inquiry/components/quote-sample-form"
import CompareProductsModal, { CompareItem } from "@modules/products/components/compare-products-modal"
import { convertToLocale } from "@lib/util/money"
import { CARD_FIELDS } from "@modules/products/lib/fields"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import RelatedProducts from "@modules/products/components/related-products"
import WishlistButton from "@modules/products/components/wishlist-button"
import { UNIT, forViewer, hsnOf, viewerFor } from "@modules/products/lib/access"
import { productJsonLd } from "@modules/products/lib/json-ld"
import { jsonLd } from "@lib/util/seo"
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

  // The page fetches the product with its collection and categories, so the
  // customer and the compare peers can load side by side.
  const brand = rawProduct.collection
  const brandCountry =
    typeof brand?.metadata?.country === "string" ? brand.metadata.country : null
  const categories = rawProduct.categories ?? []
  // Most specific first: categories that have a parent.
  const primaryCategory =
    categories.find((c) => c.parent_category_id) ?? categories[0]

  // Compare: this product plus up to 3 others from its most specific category.
  const [customer, peers] = await Promise.all([
    retrieveCustomer(),
    primaryCategory
      ? listProducts({
          regionId: region.id,
          queryParams: {
            category_id: [primaryCategory.id],
            limit: 8,
            fields: CARD_FIELDS,
          },
        })
          .then(({ response }) =>
            response.products.filter((p) => p.id !== rawProduct.id).slice(0, 3)
          )
          .catch(() => [] as HttpTypes.StoreProduct[])
      : Promise.resolve([] as HttpTypes.StoreProduct[]),
  ])

  const viewer = viewerFor(customer, [rawProduct])
  const product = forViewer(rawProduct, viewer)
  const wishlist = await wishlistOf(customer)
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

  const priceOf = (p: HttpTypes.StoreProduct) =>
    viewer === "approved" ? p.variants?.[0]?.calculated_price ?? undefined : undefined
  const comparePool = [product, ...peers]
  const knownPrices = comparePool
    .map((p) => priceOf(p)?.calculated_amount)
    .filter((a): a is number => typeof a === "number")
  const bestPrice = knownPrices.length > 1 ? Math.min(...knownPrices) : undefined
  const compareItems: CompareItem[] = comparePool.map((p) => {
    const cp = priceOf(p)
    const amount = cp?.calculated_amount
    return {
      id: p.id,
      handle: p.handle ?? "",
      title: p.title ?? "",
      thumbnail: p.thumbnail,
      brand: (p.id === product.id ? brand?.title : p.collection?.title) ?? undefined,
      price:
        typeof amount === "number" && cp?.currency_code
          ? `${convertToLocale({ amount, currency_code: cp.currency_code })}/${UNIT}`
          : undefined,
      best: bestPrice !== undefined && amount === bestPrice,
      moq: `${minQuantityOf(p.variants?.[0])} ${UNIT}`,
      hsn: hsnOf(p),
    }
  })

  const currentPrice = priceOf(product)
  const origin = product.origin_country || firstVariant?.origin_country || brandCountry
  const material = product.material || firstVariant?.material
  const specs = (
    [
      ["Brand", brand?.title],
      ["Category", primaryCategory?.name],
      ["Origin", origin],
      ["MOQ", `${moq} ${UNIT}`],
      ["Material", material],
      ["HSN Code", hsn],
      ["SKU", firstVariant?.sku],
    ] as [string, string | null | undefined][]
  ).filter((r): r is [string, string] => !!r[1])

  // Documents only when the product carries them: metadata.documents = [{ name, url, type? }].
  const rawDocs = product.metadata?.documents
  const documents = Array.isArray(rawDocs)
    ? (rawDocs as Record<string, unknown>[]).filter(
        (d) => d && typeof d.name === "string" && typeof d.url === "string"
      ) as { name: string; url: string; type?: string }[]
    : []

  const customerName = [customer?.first_name, customer?.last_name]
    .filter(Boolean)
    .join(" ")

  // `currentPrice` is only set for approved viewers, so guests get no Offer.
  const structuredData = productJsonLd({
    product,
    countryCode,
    brand: brand?.title,
    category: primaryCategory?.name,
    price: currentPrice,
    stock,
  })

  return (
    <div className="bg-[#f7faf9] min-h-screen" data-testid="product-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(structuredData)}
      />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <nav className="flex items-center gap-2 text-xs text-[#64748b] mb-5">
          <LocalizedClientLink href="/" className="hover:text-[#166534]">Home</LocalizedClientLink>
          <span>›</span>
          <LocalizedClientLink href="/store" className="hover:text-[#166534]">Ingredients</LocalizedClientLink>
          <span>›</span>
          <span className="text-[#0f172a] font-medium truncate">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] gap-6">
          <div className="self-start bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
            <ImageGallery images={images} title={product.title} />
            {product.description && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <h2 className="text-base font-extrabold text-[#0f172a]">Product Description</h2>
                <div
                  className="product-description text-sm text-[#475569] leading-relaxed mt-2"
                  data-testid="product-description"
                  dangerouslySetInnerHTML={{ __html: safeDescriptionHtml(product.description) }}
                />
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4" data-testid="spec-chips">
              {chips.map(([label, value]) => (
                <div key={label} className="bg-[#f8fffe] border border-[#dcfce7] rounded-lg p-3">
                  <div className="text-[9px] uppercase tracking-wider text-[#64748b]">{label}</div>
                  <div className="text-xs font-bold text-[#0f172a] mt-1 break-words">{value}</div>
                </div>
              ))}
            </div>
            {currentPrice?.calculated_amount != null && currentPrice.currency_code && (
              <div className="mt-4 p-4 bg-[#f8fffe] border border-[#dcfce7] rounded-xl">
                <h2 className="text-base font-extrabold text-[#0f172a]">Price Decrease & Expected Savings</h2>
                <p className="text-[10px] text-[#64748b] mt-0.5">Expected values are forecasts, not guaranteed prices.</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    ["Current Price", `${convertToLocale({ amount: currentPrice.calculated_amount, currency_code: currentPrice.currency_code })}/${UNIT}`],
                    ["Expected Price", "Not available"],
                    ["Expected Decrease", "Not available"],
                    ["Expected Savings", "Not available"],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-white border border-gray-100 rounded-lg p-2.5">
                      <div className="text-[9px] text-[#64748b]">{label}</div>
                      <div className="text-xs font-extrabold text-[#0f172a] mt-1">{value}</div>
                    </div>
                  ))}
                </div>
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
                    className="inline-block text-sm font-semibold text-[#0757a8] mt-2 hover:text-[#166534]"
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
              <ProductActionsWrapper product={product} region={region} viewer={viewer} />
            </Suspense>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="#inquiry"
                className="py-3 text-center bg-[#0757a8] hover:bg-[#064985] text-white text-sm font-bold rounded-xl"
              >
                Request Quote
              </a>
              <a
                href="#inquiry"
                className="py-3 text-center border border-[#166534]/40 text-[#166534] text-sm font-semibold rounded-xl hover:bg-[#f0fdf4]"
              >
                Request Sample
              </a>
              <div className="col-span-2 grid">
                <CompareProductsModal
                  items={compareItems}
                  currentId={product.id}
                  categoryName={primaryCategory?.name}
                />
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={null}>
          <RelatedProducts
            product={product}
            categoryIds={categories.map((c) => c.id)}
            countryCode={countryCode}
            viewer={viewer}
          />
        </Suspense>

        <div
          className={`grid grid-cols-1 gap-5 mt-6 ${documents.length ? "lg:grid-cols-[1fr_320px]" : ""}`}
        >
          <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm" data-testid="tech-specs">
            <h2 className="text-lg font-extrabold text-[#0f172a] mb-4">Technical Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {specs.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3 border-b border-gray-100 sm:odd:pr-5 sm:even:pl-5">
                  <span className="text-xs text-[#64748b]">{label}</span>
                  <span className="text-xs font-semibold text-[#0f172a] text-right">{value}</span>
                </div>
              ))}
            </div>
          </section>
          {documents.length > 0 && (
            <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-extrabold text-[#0f172a] mb-4">Documents</h2>
              {documents.map((doc) => (
                <a
                  key={doc.url}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-left border border-gray-100 rounded-xl p-3 mb-2 hover:border-[#166534]/30"
                >
                  <div className="text-xs font-bold text-[#0f172a]">{doc.name}</div>
                  {doc.type && <div className="text-[10px] text-[#64748b] mt-1">{doc.type}</div>}
                </a>
              ))}
            </section>
          )}
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

      </div>
    </div>
  )
}

export default ProductTemplate
