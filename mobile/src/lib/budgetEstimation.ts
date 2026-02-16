/**
 * F8-008: Budget estimation
 *
 * Estimates approximate cost of the shopping list based on regional price data.
 * Currently supports Colombia (COP) with average market prices.
 */

import { IngredientItem } from '../data/plan';

// ─── Types ───

export type Currency = 'COP' | 'USD';

export type PriceEstimate = {
  ingredientName: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  subtotal: number;
  currency: Currency;
  confidence: 'high' | 'medium' | 'low';
};

export type BudgetSummary = {
  items: PriceEstimate[];
  total: number;
  currency: Currency;
  region: string;
  disclaimer: string;
};

// ─── Regional price database (Colombia, COP per unit) ───

type PriceEntry = {
  pricePerUnit: number;
  unit: string;
  currency: Currency;
};

const COP_PRICES: Record<string, PriceEntry> = {
  // Produce
  potato: { pricePerUnit: 3500, unit: 'kg', currency: 'COP' },
  corn: { pricePerUnit: 2000, unit: 'unit', currency: 'COP' },
  carrot: { pricePerUnit: 3000, unit: 'kg', currency: 'COP' },
  tomato: { pricePerUnit: 4000, unit: 'kg', currency: 'COP' },
  onion: { pricePerUnit: 3500, unit: 'kg', currency: 'COP' },
  lettuce: { pricePerUnit: 3000, unit: 'unit', currency: 'COP' },
  avocado: { pricePerUnit: 3500, unit: 'unit', currency: 'COP' },
  lemon: { pricePerUnit: 500, unit: 'unit', currency: 'COP' },
  garlic: { pricePerUnit: 500, unit: 'clove', currency: 'COP' },
  plantain: { pricePerUnit: 1500, unit: 'unit', currency: 'COP' },
  yuca: { pricePerUnit: 3000, unit: 'kg', currency: 'COP' },
  'bell pepper': { pricePerUnit: 2000, unit: 'unit', currency: 'COP' },
  peas: { pricePerUnit: 6000, unit: 'kg', currency: 'COP' },
  spinach: { pricePerUnit: 4000, unit: 'kg', currency: 'COP' },
  pumpkin: { pricePerUnit: 3000, unit: 'kg', currency: 'COP' },
  basil: { pricePerUnit: 2000, unit: 'bunch', currency: 'COP' },
  rosemary: { pricePerUnit: 2000, unit: 'bunch', currency: 'COP' },
  celery: { pricePerUnit: 4000, unit: 'kg', currency: 'COP' },
  broccoli: { pricePerUnit: 6000, unit: 'kg', currency: 'COP' },
  'mixed vegetables': { pricePerUnit: 8000, unit: 'kg', currency: 'COP' },
  'sweet corn': { pricePerUnit: 5000, unit: 'kg', currency: 'COP' },

  // Protein
  'chicken breast': { pricePerUnit: 14000, unit: 'kg', currency: 'COP' },
  'chicken thigh': { pricePerUnit: 10000, unit: 'kg', currency: 'COP' },
  beef: { pricePerUnit: 28000, unit: 'kg', currency: 'COP' },
  'ground beef': { pricePerUnit: 22000, unit: 'kg', currency: 'COP' },
  'ground chicken': { pricePerUnit: 16000, unit: 'kg', currency: 'COP' },
  'tilapia fillet': { pricePerUnit: 18000, unit: 'kg', currency: 'COP' },
  tuna: { pricePerUnit: 5000, unit: 'can', currency: 'COP' },
  'turkey slices': { pricePerUnit: 20000, unit: 'kg', currency: 'COP' },
  egg: { pricePerUnit: 600, unit: 'unit', currency: 'COP' },
  'seafood mix': { pricePerUnit: 25000, unit: 'kg', currency: 'COP' },

  // Pantry
  rice: { pricePerUnit: 4500, unit: 'kg', currency: 'COP' },
  lentils: { pricePerUnit: 6000, unit: 'kg', currency: 'COP' },
  pasta: { pricePerUnit: 5000, unit: 'kg', currency: 'COP' },
  beans: { pricePerUnit: 5500, unit: 'kg', currency: 'COP' },
  chickpeas: { pricePerUnit: 7000, unit: 'kg', currency: 'COP' },
  quinoa: { pricePerUnit: 18000, unit: 'kg', currency: 'COP' },
  tortillas: { pricePerUnit: 500, unit: 'unit', currency: 'COP' },
  'tortilla wrap': { pricePerUnit: 800, unit: 'unit', currency: 'COP' },
  'burger buns': { pricePerUnit: 1000, unit: 'unit', currency: 'COP' },
  'tomato sauce': { pricePerUnit: 5000, unit: 'l', currency: 'COP' },
  'soy sauce': { pricePerUnit: 8000, unit: 'l', currency: 'COP' },
  'coconut milk': { pricePerUnit: 7000, unit: 'l', currency: 'COP' },
  'pre-cooked corn flour': { pricePerUnit: 5000, unit: 'kg', currency: 'COP' },
  arepa: { pricePerUnit: 800, unit: 'unit', currency: 'COP' },

  // Dairy
  cheese: { pricePerUnit: 22000, unit: 'kg', currency: 'COP' },
  milk: { pricePerUnit: 4000, unit: 'l', currency: 'COP' },
};

// ─── USD approximate prices ───

const USD_PRICES: Record<string, PriceEntry> = {
  potato: { pricePerUnit: 2.5, unit: 'kg', currency: 'USD' },
  'chicken breast': { pricePerUnit: 8, unit: 'kg', currency: 'USD' },
  beef: { pricePerUnit: 15, unit: 'kg', currency: 'USD' },
  rice: { pricePerUnit: 3, unit: 'kg', currency: 'USD' },
  egg: { pricePerUnit: 0.35, unit: 'unit', currency: 'USD' },
  milk: { pricePerUnit: 3.5, unit: 'l', currency: 'USD' },
  cheese: { pricePerUnit: 12, unit: 'kg', currency: 'USD' },
  pasta: { pricePerUnit: 3, unit: 'kg', currency: 'USD' },
  tomato: { pricePerUnit: 3.5, unit: 'kg', currency: 'USD' },
};

// ─── Unit conversions ───

const UNIT_TO_KG: Record<string, number> = {
  g: 0.001,
  kg: 1,
  ml: 0.001,
  l: 1,
};

function normalizeToBaseUnit(amount: number, unit: string): { amount: number; baseUnit: string } {
  const lower = unit.toLowerCase();
  if (lower === 'unit' || lower === 'can' || lower === 'clove' || lower === 'bunch') {
    return { amount, baseUnit: lower };
  }
  const factor = UNIT_TO_KG[lower];
  if (factor) {
    return { amount: amount * factor, baseUnit: lower === 'ml' || lower === 'l' ? 'l' : 'kg' };
  }
  return { amount, baseUnit: lower };
}

// ─── Public API ───

export function estimateIngredientCost(
  ingredient: IngredientItem,
  region = 'CO',
): PriceEstimate {
  const priceDb = region === 'CO' ? COP_PRICES : USD_PRICES;
  const currency: Currency = region === 'CO' ? 'COP' : 'USD';
  const nameLower = ingredient.name.toLowerCase();

  // Find matching price entry
  const priceEntry = priceDb[nameLower] ?? findFuzzyMatch(nameLower, priceDb);

  if (!priceEntry) {
    // No price data — estimate based on category
    const fallbackPrice = getFallbackPrice(ingredient.category, currency);
    const { amount } = normalizeToBaseUnit(ingredient.amount, ingredient.unit);
    return {
      ingredientName: ingredient.name,
      unitPrice: fallbackPrice,
      quantity: amount,
      unit: ingredient.unit,
      subtotal: Math.round(fallbackPrice * amount),
      currency,
      confidence: 'low',
    };
  }

  const { amount, baseUnit } = normalizeToBaseUnit(ingredient.amount, ingredient.unit);
  const effectiveAmount = baseUnit === priceEntry.unit ? amount : ingredient.amount;
  const subtotal = Math.round(priceEntry.pricePerUnit * effectiveAmount);

  return {
    ingredientName: ingredient.name,
    unitPrice: priceEntry.pricePerUnit,
    quantity: ingredient.amount,
    unit: ingredient.unit,
    subtotal,
    currency,
    confidence: 'high',
  };
}

export function estimateBudget(
  ingredients: IngredientItem[],
  region = 'CO',
): BudgetSummary {
  const currency: Currency = region === 'CO' ? 'COP' : 'USD';
  const items = ingredients.map((ing) => estimateIngredientCost(ing, region));
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    items,
    total,
    currency,
    region,
    disclaimer: currency === 'COP'
      ? 'Precios aproximados basados en promedios del mercado colombiano. Los precios reales pueden variar.'
      : 'Approximate prices based on average market data. Actual prices may vary.',
  };
}

export function formatPrice(amount: number, currency: Currency): string {
  if (currency === 'COP') {
    return `$${amount.toLocaleString('es-CO')}`;
  }
  return `$${amount.toFixed(2)}`;
}

// ─── Helpers ───

function findFuzzyMatch(name: string, db: Record<string, PriceEntry>): PriceEntry | null {
  for (const [key, entry] of Object.entries(db)) {
    if (name.includes(key) || key.includes(name)) return entry;
  }
  return null;
}

function getFallbackPrice(category: IngredientItem['category'], currency: Currency): number {
  const fallbacks: Record<string, Record<Currency, number>> = {
    Produce: { COP: 5000, USD: 3 },
    Protein: { COP: 15000, USD: 8 },
    Pantry: { COP: 6000, USD: 4 },
    Dairy: { COP: 8000, USD: 5 },
  };
  return fallbacks[category]?.[currency] ?? (currency === 'COP' ? 5000 : 3);
}
