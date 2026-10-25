import { intersectIds } from '../warehouse-product-filter';
import {
  availableQuantity,
  defaultWarehouse,
  distanceKm,
  isUsableCoordinate,
  resolveLocation,
  type Warehouse,
} from '../warehouses';

const warehouse = (overrides: Partial<Warehouse>): Warehouse => ({
  id: 'sloc_x',
  name: 'X Warehouse',
  city: 'X',
  lat: 0,
  lng: 0,
  is_default: false,
  ...overrides,
});

const bangalore = warehouse({
  id: 'sloc_blr',
  city: 'Bangalore',
  lat: 12.9716,
  lng: 77.5946,
  is_default: true,
});
const delhi = warehouse({ id: 'sloc_del', city: 'Delhi', lat: 28.6139, lng: 77.209 });
const mumbai = warehouse({ id: 'sloc_bom', city: 'Mumbai', lat: 19.076, lng: 72.8777 });
const all = [bangalore, delhi, mumbai];

describe('distanceKm', () => {
  it('is zero for the same point', () => {
    expect(distanceKm(12.97, 77.59, 12.97, 77.59)).toBe(0);
  });

  it('matches the known Bangalore to Mumbai distance', () => {
    // About 845 km in a straight line.
    const km = distanceKm(bangalore.lat, bangalore.lng, mumbai.lat, mumbai.lng);
    expect(km).toBeGreaterThan(830);
    expect(km).toBeLessThan(860);
  });
});

describe('isUsableCoordinate', () => {
  it('accepts a real coordinate', () => {
    expect(isUsableCoordinate(12.97, 77.59)).toBe(true);
  });

  it.each([
    [null, 77],
    [12, undefined],
    [91, 0],
    [0, 181],
    [Number.NaN, 0],
  ])('rejects %p, %p', (lat, lng) => {
    expect(isUsableCoordinate(lat as number | null, lng as number | undefined)).toBe(false);
  });
});

describe('defaultWarehouse', () => {
  it('prefers the one flagged as default', () => {
    expect(defaultWarehouse([delhi, bangalore])).toBe(bangalore);
  });

  it('falls back to the first one', () => {
    expect(defaultWarehouse([delhi, mumbai])).toBe(delhi);
  });

  it('is undefined for no warehouses', () => {
    expect(defaultWarehouse([])).toBeUndefined();
  });
});

describe('resolveLocation', () => {
  it('is null without warehouses', () => {
    expect(resolveLocation([], 19, 72)).toBeNull();
  });

  it('picks the nearest warehouse to a coordinate', () => {
    // Pune is nearest to Mumbai.
    const resolved = resolveLocation(all, 18.5204, 73.8567);
    expect(resolved?.warehouse).toBe(mumbai);
    expect(resolved?.resolved_from).toBe('coordinates');
    expect(resolved?.distance_km).toBeGreaterThan(100);
    expect(resolved?.distance_km).toBeLessThan(150);
  });

  it('falls back to the default without a usable coordinate', () => {
    expect(resolveLocation(all, null, null)).toEqual({
      warehouse: bangalore,
      distance_km: null,
      resolved_from: 'default',
    });
    expect(resolveLocation(all, 500, 500)?.warehouse).toBe(bangalore);
  });
});

describe('availableQuantity', () => {
  it('is stocked minus reserved', () => {
    expect(availableQuantity({ stocked_quantity: 100, reserved_quantity: 30 })).toBe(70);
  });

  it('treats missing values as zero', () => {
    expect(availableQuantity({ stocked_quantity: 5 })).toBe(5);
    expect(availableQuantity({})).toBe(0);
  });
});

describe('intersectIds', () => {
  const nothing = ['__no_product_at_this_warehouse__'];

  it('uses the warehouse ids when there is no id filter yet', () => {
    expect(intersectIds(undefined, ['p1', 'p2'])).toEqual(['p1', 'p2']);
  });

  it('keeps only ids that are in both', () => {
    expect(intersectIds(['p1', 'p3'], ['p1', 'p2'])).toEqual(['p1']);
    expect(intersectIds('p2', ['p1', 'p2'])).toEqual(['p2']);
  });

  it('matches nothing when the warehouse carries nothing or there is no overlap', () => {
    expect(intersectIds(undefined, [])).toEqual(nothing);
    expect(intersectIds(['p3'], ['p1'])).toEqual(nothing);
  });
});
