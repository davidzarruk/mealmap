/**
 * F10-008: Seasonal Ingredients — Colombia
 *
 * Monthly availability map for common Colombian produce.
 * Used to prioritize seasonal ingredients in meal generation.
 */

export type SeasonalEntry = {
  name: string;
  category: 'fruit' | 'vegetable' | 'herb' | 'grain';
  months: number[]; // 1-12
  region?: string;
};

/**
 * Seasonal produce data for Colombia.
 * Sources: DANE agricultural calendar, local market knowledge.
 */
export const seasonalIngredientsColombia: SeasonalEntry[] = [
  // ─── Fruits ───
  { name: 'Mango', category: 'fruit', months: [1, 2, 3, 4, 6, 7, 8] },
  { name: 'Guanábana', category: 'fruit', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Lulo', category: 'fruit', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Maracuyá', category: 'fruit', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Papaya', category: 'fruit', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Piña', category: 'fruit', months: [3, 4, 5, 6, 7, 8] },
  { name: 'Aguacate Hass', category: 'fruit', months: [3, 4, 5, 9, 10, 11] },
  { name: 'Tomate de árbol', category: 'fruit', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Uchuva', category: 'fruit', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Guayaba', category: 'fruit', months: [1, 2, 6, 7, 8, 12] },
  { name: 'Mora', category: 'fruit', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Curuba', category: 'fruit', months: [3, 4, 5, 9, 10, 11] },
  { name: 'Feijoa', category: 'fruit', months: [3, 4, 5, 10, 11] },
  { name: 'Zapote', category: 'fruit', months: [6, 7, 8, 9] },
  { name: 'Granadilla', category: 'fruit', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Banano', category: 'fruit', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Plátano', category: 'fruit', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Fresa', category: 'fruit', months: [1, 2, 3, 9, 10, 11, 12] },
  { name: 'Mandarina', category: 'fruit', months: [4, 5, 6, 7, 8] },
  { name: 'Naranja', category: 'fruit', months: [1, 2, 3, 6, 7, 8, 12] },

  // ─── Vegetables ───
  { name: 'Papa criolla', category: 'vegetable', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Yuca', category: 'vegetable', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Arracacha', category: 'vegetable', months: [1, 2, 3, 7, 8, 9] },
  { name: 'Ñame', category: 'vegetable', months: [3, 4, 5, 10, 11, 12] },
  { name: 'Ahuyama', category: 'vegetable', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Tomate', category: 'vegetable', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Cebolla cabezona', category: 'vegetable', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Cebolla larga', category: 'vegetable', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Zanahoria', category: 'vegetable', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Habichuela', category: 'vegetable', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Mazorca', category: 'vegetable', months: [3, 4, 5, 6, 9, 10, 11] },
  { name: 'Pepino cohombro', category: 'vegetable', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Lechuga', category: 'vegetable', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Espinaca', category: 'vegetable', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Pimentón', category: 'vegetable', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Remolacha', category: 'vegetable', months: [1, 2, 6, 7, 8, 12] },
  { name: 'Acelga', category: 'vegetable', months: [3, 4, 5, 9, 10, 11] },
  { name: 'Brócoli', category: 'vegetable', months: [1, 2, 3, 9, 10, 11, 12] },
  { name: 'Coliflor', category: 'vegetable', months: [1, 2, 3, 9, 10, 11, 12] },
  { name: 'Fríjol verde', category: 'vegetable', months: [3, 4, 5, 9, 10, 11] },

  // ─── Herbs ───
  { name: 'Cilantro', category: 'herb', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Perejil', category: 'herb', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Albahaca', category: 'herb', months: [3, 4, 5, 6, 9, 10, 11] },
  { name: 'Orégano fresco', category: 'herb', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Tomillo', category: 'herb', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Hierba buena', category: 'herb', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },

  // ─── Grains / Legumes ───
  { name: 'Fríjol rojo', category: 'grain', months: [3, 4, 5, 9, 10, 11] },
  { name: 'Lenteja', category: 'grain', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Garbanzo', category: 'grain', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: 'Arroz', category: 'grain', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
];

/**
 * Get ingredients that are in season for a given month (1-12).
 */
export function getSeasonalIngredients(month: number): SeasonalEntry[] {
  return seasonalIngredientsColombia.filter((entry) =>
    entry.months.includes(month),
  );
}

/**
 * Check if a specific ingredient is in season for the given month.
 */
export function isInSeason(ingredientName: string, month: number): boolean {
  const normalized = ingredientName.toLowerCase();
  return seasonalIngredientsColombia.some(
    (entry) =>
      entry.name.toLowerCase() === normalized &&
      entry.months.includes(month),
  );
}

/**
 * Get a human-readable seasonal summary for a given month.
 */
export function getSeasonalSummary(month: number): {
  fruits: string[];
  vegetables: string[];
  herbs: string[];
  grains: string[];
} {
  const items = getSeasonalIngredients(month);
  return {
    fruits: items.filter((i) => i.category === 'fruit').map((i) => i.name),
    vegetables: items.filter((i) => i.category === 'vegetable').map((i) => i.name),
    herbs: items.filter((i) => i.category === 'herb').map((i) => i.name),
    grains: items.filter((i) => i.category === 'grain').map((i) => i.name),
  };
}
