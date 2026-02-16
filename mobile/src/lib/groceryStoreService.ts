/**
 * F10-003: Grocery Store Integration Prep
 *
 * Abstract service layer for Colombian grocery delivery APIs (Rappi, Merqueo).
 * Ships with a mock implementation; real API integrations plug in later.
 */

import { IngredientItem } from '../data/plan';

// ─── Types ───

export type GroceryStore = 'rappi' | 'merqueo';

export type GroceryProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: 'COP';
  unit: string;
  quantity: number;
  imageUrl: string | null;
  store: GroceryStore;
  available: boolean;
  category: string;
};

export type GrocerySearchResult = {
  query: string;
  store: GroceryStore;
  products: GroceryProduct[];
  totalResults: number;
};

export type GroceryCartItem = {
  product: GroceryProduct;
  quantity: number;
};

export type GroceryCart = {
  store: GroceryStore;
  items: GroceryCartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: 'COP';
  estimatedDeliveryMin: number;
};

export type GroceryStoreInfo = {
  id: GroceryStore;
  name: string;
  logoUrl: string;
  available: boolean;
  deliveryFeeRange: { min: number; max: number };
  minOrder: number;
  currency: 'COP';
};

// ─── Interface ───

export interface IGroceryStoreProvider {
  getStoreInfo(): Promise<GroceryStoreInfo>;
  searchProducts(query: string, limit?: number): Promise<GrocerySearchResult>;
  buildCartFromIngredients(ingredients: IngredientItem[]): Promise<GroceryCart>;
  getDeepLink(product?: GroceryProduct): string;
}

// ─── Mock Implementation ───

function mockProduct(
  store: GroceryStore,
  name: string,
  price: number,
  unit: string,
  category: string,
): GroceryProduct {
  return {
    id: `${store}-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    name,
    brand: store === 'rappi' ? 'Marca Local' : 'Merqueo Selección',
    price,
    currency: 'COP',
    unit,
    quantity: 1,
    imageUrl: null,
    store,
    available: true,
    category,
  };
}

const MOCK_PRICES: Record<string, { price: number; unit: string; category: string }> = {
  potato: { price: 3500, unit: 'kg', category: 'Frutas y Verduras' },
  chicken: { price: 14000, unit: 'kg', category: 'Carnes' },
  rice: { price: 4500, unit: 'kg', category: 'Granos' },
  tomato: { price: 4000, unit: 'kg', category: 'Frutas y Verduras' },
  onion: { price: 3500, unit: 'kg', category: 'Frutas y Verduras' },
  egg: { price: 600, unit: 'unit', category: 'Lácteos y Huevos' },
  cheese: { price: 22000, unit: 'kg', category: 'Lácteos y Huevos' },
  milk: { price: 4000, unit: 'l', category: 'Lácteos y Huevos' },
  pasta: { price: 5000, unit: 'kg', category: 'Granos' },
  beans: { price: 5500, unit: 'kg', category: 'Granos' },
  avocado: { price: 3500, unit: 'unit', category: 'Frutas y Verduras' },
  lemon: { price: 500, unit: 'unit', category: 'Frutas y Verduras' },
};

class MockGroceryProvider implements IGroceryStoreProvider {
  constructor(private store: GroceryStore) {}

  async getStoreInfo(): Promise<GroceryStoreInfo> {
    const infos: Record<GroceryStore, GroceryStoreInfo> = {
      rappi: {
        id: 'rappi',
        name: 'Rappi',
        logoUrl: 'https://example.com/rappi-logo.png',
        available: true,
        deliveryFeeRange: { min: 3900, max: 7900 },
        minOrder: 15000,
        currency: 'COP',
      },
      merqueo: {
        id: 'merqueo',
        name: 'Merqueo',
        logoUrl: 'https://example.com/merqueo-logo.png',
        available: true,
        deliveryFeeRange: { min: 0, max: 5900 },
        minOrder: 30000,
        currency: 'COP',
      },
    };
    return infos[this.store];
  }

  async searchProducts(query: string, limit = 10): Promise<GrocerySearchResult> {
    const q = query.toLowerCase();
    const matches = Object.entries(MOCK_PRICES)
      .filter(([key]) => key.includes(q) || q.includes(key))
      .slice(0, limit)
      .map(([key, info]) => mockProduct(this.store, key, info.price, info.unit, info.category));

    // If no direct match, return a generic result
    if (matches.length === 0) {
      matches.push(mockProduct(this.store, query, 5000, 'unit', 'Otros'));
    }

    return {
      query,
      store: this.store,
      products: matches,
      totalResults: matches.length,
    };
  }

  async buildCartFromIngredients(ingredients: IngredientItem[]): Promise<GroceryCart> {
    const items: GroceryCartItem[] = [];

    for (const ing of ingredients) {
      const nameLower = ing.name.toLowerCase();
      const priceInfo = MOCK_PRICES[nameLower] ??
        Object.entries(MOCK_PRICES).find(([k]) => nameLower.includes(k))?.[1] ??
        { price: 5000, unit: ing.unit, category: 'Otros' };

      const product = mockProduct(this.store, ing.name, priceInfo.price, priceInfo.unit, priceInfo.category);
      items.push({ product, quantity: Math.ceil(ing.amount / 1000) || 1 });
    }

    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const deliveryFee = this.store === 'rappi' ? 5900 : (subtotal >= 50000 ? 0 : 3900);

    return {
      store: this.store,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      currency: 'COP',
      estimatedDeliveryMin: this.store === 'rappi' ? 35 : 120,
    };
  }

  getDeepLink(product?: GroceryProduct): string {
    if (this.store === 'rappi') {
      return product
        ? `https://www.rappi.com.co/search?term=${encodeURIComponent(product.name)}`
        : 'https://www.rappi.com.co';
    }
    return product
      ? `https://merqueo.com/buscar?q=${encodeURIComponent(product.name)}`
      : 'https://merqueo.com';
  }
}

// ─── Factory ───

const providers: Partial<Record<GroceryStore, IGroceryStoreProvider>> = {};

export function getGroceryProvider(store: GroceryStore): IGroceryStoreProvider {
  if (!providers[store]) {
    providers[store] = new MockGroceryProvider(store);
  }
  return providers[store]!;
}

export function getAvailableStores(): GroceryStore[] {
  return ['rappi', 'merqueo'];
}

/**
 * Compare prices across all stores for a list of ingredients.
 */
export async function compareStorePrices(
  ingredients: IngredientItem[],
): Promise<Record<GroceryStore, GroceryCart>> {
  const stores = getAvailableStores();
  const results: Partial<Record<GroceryStore, GroceryCart>> = {};

  for (const store of stores) {
    const provider = getGroceryProvider(store);
    results[store] = await provider.buildCartFromIngredients(ingredients);
  }

  return results as Record<GroceryStore, GroceryCart>;
}
