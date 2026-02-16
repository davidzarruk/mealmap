import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITE_MEALS_KEY = 'mealmap/favorite-meal-ids';
const SHOPPING_OVERRIDES_KEY = 'mealmap/shopping-overrides';

export type ShoppingItemOverride = {
  name: string;
  amount: string;
  unit: string;
};

export type ShoppingOverridesMap = Record<string, ShoppingItemOverride>;

export async function loadFavoriteMealIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(FAVORITE_MEALS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

export async function saveFavoriteMealIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITE_MEALS_KEY, JSON.stringify(ids));
}

export async function loadShoppingOverrides(): Promise<ShoppingOverridesMap> {
  const raw = await AsyncStorage.getItem(SHOPPING_OVERRIDES_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as ShoppingOverridesMap;
  } catch {
    return {};
  }
}

export async function saveShoppingOverrides(overrides: ShoppingOverridesMap): Promise<void> {
  await AsyncStorage.setItem(SHOPPING_OVERRIDES_KEY, JSON.stringify(overrides));
}
