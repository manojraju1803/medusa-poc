/* eslint-disable @next/next/no-img-element */
import type { Supplier } from "../data"

const initials = (title: string) =>
  title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("")

const SupplierLogo = ({
  supplier,
  size = "md",
}: {
  supplier: Pick<Supplier, "title" | "logo">
  size?: "md" | "lg"
}) => {
  const box =
    size === "lg"
      ? "w-16 h-16 rounded-2xl text-lg border-4 border-white shadow-md"
      : "w-10 h-10 rounded-lg text-xs"

  if (supplier.logo) {
    return (
      <img
        src={supplier.logo}
        alt={supplier.title}
        className={`${box} object-contain bg-white shrink-0`}
      />
    )
  }

  return (
    <div
      className={`${box} bg-[#4d7c0f] flex items-center justify-center text-white font-extrabold shrink-0`}
    >
      {initials(supplier.title)}
    </div>
  )
}

export default SupplierLogo
