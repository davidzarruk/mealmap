/**
 * F8-002: Meal image service
 *
 * Generates image URLs for meals using Unsplash free API or placeholder URLs.
 * Falls back to color-coded placeholders based on meal category.
 */

import { MealCard } from '../data/plan';

// ─── Types ───

export type MealImageResult = {
  url: string;
  source: 'unsplash' | 'placeholder';
  attribution?: string;
};

// ─── Unsplash (free, no auth needed for source.unsplash.com) ───

const UNSPLASH_BASE = 'https://source.unsplash.com';

function buildUnsplashUrl(query: string, width = 400, height = 300): string {
  const encoded = encodeURIComponent(query);
  return `${UNSPLASH_BASE}/${width}x${height}/?${encoded},food`;
}

// ─── Category keyword extraction ───

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  chicken: ['chicken', 'pollo'],
  beef: ['beef', 'steak', 'meat', 'carne', 'meatball'],
  fish: ['fish', 'tilapia', 'tuna', 'salmon', 'seafood'],
  pasta: ['pasta', 'spaghetti', 'noodle'],
  rice: ['rice', 'arroz', 'paella', 'fried rice'],
  soup: ['soup', 'stew', 'sancocho', 'ajiaco', 'cream', 'broth'],
  salad: ['salad', 'ensalada'],
  egg: ['egg', 'omelette', 'perico'],
  vegetable: ['vegetable', 'veggie', 'lentil', 'chickpea', 'bean', 'quinoa'],
  wrap: ['wrap', 'taco', 'burrito', 'arepa', 'tortilla'],
  burger: ['burger', 'hamburger'],
};

function detectCategory(title: string): string {
  const lower = title.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return 'food';
}

// ─── Placeholder colors by category ───

const CATEGORY_COLORS: Record<string, string> = {
  chicken: '#F59E0B',
  beef: '#DC2626',
  fish: '#3B82F6',
  pasta: '#F97316',
  rice: '#FBBF24',
  soup: '#10B981',
  salad: '#22C55E',
  egg: '#EAB308',
  vegetable: '#16A34A',
  wrap: '#8B5CF6',
  burger: '#B91C1C',
  food: '#6366F1',
};

const CATEGORY_EMOJI: Record<string, string> = {
  chicken: '🍗',
  beef: '🥩',
  fish: '🐟',
  pasta: '🍝',
  rice: '🍚',
  soup: '🍲',
  salad: '🥗',
  egg: '🍳',
  vegetable: '🥬',
  wrap: '🌮',
  burger: '🍔',
  food: '🍽️',
};

// ─── Public API ───

/**
 * Get an image URL for a meal. Uses Unsplash source redirect (no API key needed).
 * Falls back gracefully — the URL will always resolve to _something_.
 */
export function getMealImageUrl(meal: MealCard | { title: string }, size?: { width?: number; height?: number }): MealImageResult {
  const w = size?.width ?? 400;
  const h = size?.height ?? 300;
  const query = meal.title.replace(/[^a-zA-Z0-9\s]/g, '').trim();

  return {
    url: buildUnsplashUrl(query, w, h),
    source: 'unsplash',
    attribution: 'Photo from Unsplash',
  };
}

/**
 * Get placeholder info for a meal (emoji + color), useful when images can't load.
 */
export function getMealPlaceholder(title: string): { emoji: string; color: string; category: string } {
  const category = detectCategory(title);
  return {
    emoji: CATEGORY_EMOJI[category] ?? '🍽️',
    color: CATEGORY_COLORS[category] ?? '#6366F1',
    category,
  };
}

/**
 * Build a deterministic placeholder image URL (no external dependency).
 * Uses a simple SVG data URI for offline/fallback scenarios.
 */
export function getPlaceholderDataUri(title: string, width = 400, height = 300): string {
  const { color, emoji } = getMealPlaceholder(title);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="${color}20"/>
    <text x="50%" y="45%" font-size="64" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    <text x="50%" y="72%" font-size="14" fill="${color}" text-anchor="middle" font-family="sans-serif">${escapeXml(title)}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Preload/cache image URL for a list of meals (no-op for now, can be extended with expo-image).
 */
export async function prefetchMealImages(meals: Array<{ title: string }>): Promise<void> {
  // Future: use Image.prefetch() or expo-image cache
  // For now this is a placeholder for the interface
  void meals;
}
