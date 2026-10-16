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
