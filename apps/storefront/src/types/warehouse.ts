export type Warehouse = {
  id: string
  city: string
  lat: number
  lng: number
  name: string
  // Set in the stock location's metadata; the backend falls back to it too.
  is_default: boolean
}

/** The warehouse a request is served from. */
export type ActiveWarehouse = {
  warehouse: Warehouse
  warehouses: Warehouse[]
  // False while it is only the default, before the buyer has picked anything.
  chosen: boolean
}

/**
 * `stocked_here` false means the warehouse does not carry the product at all,
 * which reads differently to a buyer than "carried but currently empty".
 */
export type WarehouseAvailability = {
  in_stock: boolean
  stocked_here: boolean
}

export type AvailabilityMap = Record<string, WarehouseAvailability | undefined>

/** Shape returned by the backend's /store/location endpoints. */
export type StoreLocation = {
  warehouse_id: string
  city: string
  name: string
  lat: number
  lng: number
  distance_km: number | null
  resolved_from: "coordinates" | "default" | "picked" | "saved"
  saved: boolean
}
