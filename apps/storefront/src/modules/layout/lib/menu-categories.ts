import { listCategories } from "@lib/data/categories"
import { MenuCategory } from "@modules/layout/components/mega-menu"

// Top-level product categories with their children, for header/footer/home.
export const getMenuCategories = async (): Promise<MenuCategory[]> => {
  const categories = await listCategories({
    parent_category_id: "null",
    limit: 100,
  }).catch(() => [])

  return categories
    .filter((c) => !c.parent_category_id && c.handle !== "uncategorized")
    .map((c) => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      children: (c.category_children ?? []).map((child) => ({
        id: child.id,
        name: child.name,
        handle: child.handle,
      })),
    }))
}

export type NavMenuGroup = {
  title: string
  items: { label: string; href: string }[]
}

// "Sweetener & Polyol" -> "sweetener polyol"; drops "&"/"and" and plural "s".
const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((w) => w && w !== "and")
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w))
    .join(" ")

// Maps each mega-menu item to a real category, else to a search.
export const getNavMenus = async (
  nutra: { title: string; items: string[] }[],
  food: { title: string; items: string[] }[]
) => {
  const all = await listCategories({ limit: 500 }).catch(() => [])
  const byName = new Map(all.map((c) => [normalise(c.name), c.handle]))

  const resolve = (
    groups: { title: string; items: string[] }[]
  ): NavMenuGroup[] =>
    groups.map((g) => ({
      title: g.title,
      items: g.items.map((label) => {
        const handle = byName.get(normalise(label))
        return {
          label,
          href: handle
            ? `/categories/${handle}`
            : `/search?q=${encodeURIComponent(label)}`,
        }
      }),
    }))

  return { nutra: resolve(nutra), food: resolve(food) }
}
