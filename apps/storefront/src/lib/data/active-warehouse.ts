import "server-only"

import { cache } from "react"
import { resolveWarehouse } from "./warehouses"

/**
 * The warehouse this request is served from.
 *
 * The header picker, the listing pills, the "Showing stock from…" note and the
 * product listing all read it from here, so they cannot disagree. `cache`
 * makes it one lookup per request however many components ask.
 *
 * Kept out of warehouses.ts because a "use server" file may only export async
 * functions, and `cache` returns a plain one.
 */
export const getActiveWarehouse = cache(resolveWarehouse)
