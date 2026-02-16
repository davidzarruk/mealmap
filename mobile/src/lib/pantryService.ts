/**
 * F9-005: Pantry Tracker Service
 *
 * CRUD for pantry items + deduction from shopping list.
 */

import { supabase } from './supabase';

export type PantryItem = {
  id: string;
  user_id: string;
  ingredient_name: string;
  amount: number | null;
  unit: string | null;
  category: string;
  added_at: string;
  expires_at: string | null;
};

export async function getPantryItems(): Promise<PantryItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('user_id', user.id)
    .order('ingredient_name');

  return (data ?? []) as PantryItem[];
}

export async function addPantryItem(item: {
  ingredient_name: string;
  amount?: number;
  unit?: string;
  category?: string;
  expires_at?: string;
}): Promise<PantryItem | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('pantry_items')
    .upsert(
      {
        user_id: user.id,
        ingredient_name: item.ingredient_name,
        amount: item.amount ?? null,
        unit: item.unit ?? null,
        category: item.category ?? 'Other',
        expires_at: item.expires_at ?? null,
      },
      { onConflict: 'user_id,ingredient_name,unit' },
    )
    .select('*')
    .single();

  if (error) return null;
  return data as PantryItem;
}

export async function removePantryItem(id: string): Promise<void> {
  await supabase.from('pantry_items').delete().eq('id', id);
}

export async function updatePantryItem(
  id: string,
  updates: Partial<Pick<PantryItem, 'amount' | 'unit' | 'category' | 'expires_at'>>,
): Promise<void> {
  await supabase.from('pantry_items').update(updates).eq('id', id);
}

/**
 * Given a shopping list, returns items adjusted for what's already in the pantry.
 */
export function deductPantryFromShopping<T extends { name: string; amount: number; unit: string }>(
  shoppingItems: T[],
  pantryItems: PantryItem[],
): Array<T & { inPantry: boolean; pantryAmount: number }> {
  return shoppingItems.map((item) => {
    const pantryMatch = pantryItems.find(
      (p) =>
        p.ingredient_name.toLowerCase() === item.name.toLowerCase() &&
        (p.unit === null || p.unit === item.unit),
    );

    if (pantryMatch && pantryMatch.amount != null) {
      const remaining = item.amount - pantryMatch.amount;
      return {
        ...item,
        amount: Math.max(0, remaining),
        inPantry: true,
        pantryAmount: pantryMatch.amount,
      };
    }

    if (pantryMatch) {
      return { ...item, amount: 0, inPantry: true, pantryAmount: 0 };
    }

    return { ...item, inPantry: false, pantryAmount: 0 };
  });
}
