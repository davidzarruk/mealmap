/**
 * F9-004: Smart Shopping List Categories
 *
 * Maps ingredients to supermarket sections for better shopping experience.
 */

export type SupermarketSection =
  | 'Fruits & Vegetables'
  | 'Meat & Seafood'
  | 'Dairy & Eggs'
  | 'Grains & Bread'
  | 'Canned & Dry Goods'
  | 'Condiments & Sauces'
  | 'Frozen'
  | 'Other';

const SECTION_EMOJI: Record<SupermarketSection, string> = {
  'Fruits & Vegetables': '🥬',
  'Meat & Seafood': '🥩',
  'Dairy & Eggs': '🥛',
  'Grains & Bread': '🍞',
  'Canned & Dry Goods': '🥫',
  'Condiments & Sauces': '🧂',
  'Frozen': '🧊',
  'Other': '📦',
};

const SECTION_ORDER: Record<SupermarketSection, number> = {
  'Fruits & Vegetables': 0,
  'Meat & Seafood': 1,
  'Dairy & Eggs': 2,
  'Grains & Bread': 3,
  'Canned & Dry Goods': 4,
  'Condiments & Sauces': 5,
  'Frozen': 6,
  'Other': 7,
};

// Keyword-based mapping
const KEYWORD_MAP: Array<[string[], SupermarketSection]> = [
  // Produce
  [['potato', 'tomato', 'onion', 'carrot', 'avocado', 'corn', 'lemon', 'garlic', 'lettuce', 'spinach', 'bell pepper', 'peas', 'broccoli', 'mixed vegetables', 'plantain', 'yuca', 'celery', 'pumpkin', 'rosemary', 'basil', 'vegetable'], 'Fruits & Vegetables'],
  // Meat & Seafood
  [['chicken', 'beef', 'turkey', 'tilapia', 'tuna', 'seafood', 'meat', 'steak', 'ground'], 'Meat & Seafood'],
  // Dairy
  [['cheese', 'milk', 'cream', 'yogurt', 'butter', 'egg'], 'Dairy & Eggs'],
  // Grains & Bread
  [['rice', 'pasta', 'quinoa', 'tortilla', 'wrap', 'bun', 'bread', 'arepa', 'corn flour', 'flour'], 'Grains & Bread'],
  // Canned & Dry
  [['lentils', 'beans', 'chickpeas', 'canned'], 'Canned & Dry Goods'],
  // Condiments
  [['soy sauce', 'tomato sauce', 'coconut milk', 'sauce', 'oil', 'vinegar', 'salt', 'pepper', 'spice'], 'Condiments & Sauces'],
  // Frozen
  [['frozen', 'ice cream'], 'Frozen'],
];

export function getSupermarketSection(ingredientName: string): SupermarketSection {
  const lower = ingredientName.toLowerCase();
  for (const [keywords, section] of KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return section;
    }
  }
  return 'Other';
}

export function getSectionEmoji(section: SupermarketSection): string {
  return SECTION_EMOJI[section] ?? '📦';
}

export function getSectionOrder(section: SupermarketSection): number {
  return SECTION_ORDER[section] ?? 7;
}

export function groupBySupermarketSection<T extends { name: string }>(
  items: T[],
): Array<{ section: SupermarketSection; emoji: string; items: T[] }> {
  const groups = new Map<SupermarketSection, T[]>();

  for (const item of items) {
    const section = getSupermarketSection(item.name);
    if (!groups.has(section)) groups.set(section, []);
    groups.get(section)!.push(item);
  }

  return Array.from(groups.entries())
    .map(([section, sectionItems]) => ({
      section,
      emoji: getSectionEmoji(section),
      items: sectionItems,
    }))
    .sort((a, b) => getSectionOrder(a.section) - getSectionOrder(b.section));
}
