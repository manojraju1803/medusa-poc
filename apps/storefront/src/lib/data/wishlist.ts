"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheTag } from "./cookies"
import { retrieveCustomer } from "./customer"

// Product ids saved in `customer.metadata.wishlist`.
export const wishlistOf = async (
  customer: HttpTypes.StoreCustomer | null
): Promise<string[]> => {
  const list = customer?.metadata?.wishlist
  return Array.isArray(list)
    ? list.filter((id): id is string => typeof id === "string")
    : []
}

export const getWishlist = async (): Promise<string[]> =>
  wishlistOf(await retrieveCustomer())

/**
 * Adds or removes a product from the signed-in customer's wishlist.
 * Returns `{ loggedOut: true }` for guests so the caller can send them to login.
 */
export const toggleWishlist = async (
  productId: string
): Promise<{ wishlist: string[]; loggedOut?: boolean; error?: string }> => {
  const customer = await retrieveCustomer()
  if (!customer) {
    return { wishlist: [], loggedOut: true }
  }

  const current = await wishlistOf(customer)
  const wishlist = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [...current, productId]

  try {
    await sdk.store.customer.update(
      { metadata: { ...(customer.metadata ?? {}), wishlist } },
      {},
      await getAuthHeaders()
    )
  } catch (e) {
    return { wishlist: current, error: (e as Error).message }
  }

  revalidateTag(await getCacheTag("customers"))
  return { wishlist }
}
