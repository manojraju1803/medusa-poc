import { HttpTypes } from "@medusajs/types"
import HomeProductCard, { PriceAccess } from "../home-product-card"
import SectionHeader from "../section-header"

const ProductRow = ({
  title,
  desc,
  products,
  access,
  badge,
  viewAllHref = "/store",
  tone = "white",
}: {
  title: string
  desc: string
  products: HttpTypes.StoreProduct[]
  access: PriceAccess
  badge?: string
  viewAllHref?: string
  tone?: "white" | "soft"
}) => {
  if (!products.length) return null

  return (
    <section
      className={`${
        tone === "soft" ? "bg-[#f8fffe]" : "bg-white"
      } py-12`}
    >
      <div className="max-w-[1440px] mx-auto px-6">
        <SectionHeader title={title} desc={desc} viewAllHref={viewAllHref} />
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <li key={p.id}>
              <HomeProductCard product={p} access={access} badge={badge} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default ProductRow
