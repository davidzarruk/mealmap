/**
 * F10-007: Leftover Tracker Service
 *
 * CRUD for leftovers + suggestion logic based on available ingredients.
 */

import { supabase } from './supabase';
import { MealCard, initialWeekMeals, replacementPool, dayTabs } from '../data/plan';

// ─── Types ───

export type Leftover = {
  id: string;
  user_id: string;
  ingredient_name: string;
  amount: number | null;
  unit: string | null;
  source_meal: string | null;
  stored_at: string;
  expires_at: string | null;
  used: boolean;
  used_at: string | null;
  notes: string | null;
};

// ─── CRUD ───

export async function getLeftovers(includeUsed = false): Promise<Leftover[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('leftovers')
    .select('*')
    .eq('user_id', user.id)
    .order('stored_at', { ascending: false });

  if (!includeUsed) {
    query = query.eq('used', false);
  }

  const { data } = await query;
  return (data ?? []) as Leftover[];
}

export async function addLeftover(item: {
  ingredient_name: string;
  amount?: number;
  unit?: string;
  source_meal?: string;
  expires_at?: string;
  notes?: string;
}): Promise<Leftover | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('leftovers')
    .insert({
      user_id: user.id,
      ingredient_name: item.ingredient_name,
      amount: item.amount ?? null,
      unit: item.unit ?? null,
      source_meal: item.source_meal ?? null,
      expires_at: item.expires_at ?? null,
      notes: item.notes ?? null,
    })
    .select('*')
    .single();

  if (error) return null;
  return data as Leftover;
}

export async function markLeftoverUsed(id: string): Promise<void> {
  await supabase
    .from('leftovers')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('id', id);
}

export async function removeLeftover(id: string): Promise<void> {
  await supabase.from('leftovers').delete().eq('id', id);
}

// ─── Suggestion Logic ───

/**
 * Suggest meals from the pool that can use the available leftovers.
 * Scores meals by how many leftover ingredients they match.
 */
export function suggestMealsForLeftovers(leftovers: Leftover[]): Array<{ meal: MealCard; matchCount: number; matchedIngredients: string[] }> {
  if (leftovers.length === 0) return [];

  const leftoverNames = new Set(
    leftovers
      .filter((l) => !l.used)
      .map((l) => l.ingredient_name.toLowerCase()),
  );

  // Gather all known meals
  const allMeals: MealCard[] = [];
  for (const day of dayTabs) {
    allMeals.push(...initialWeekMeals[day], ...replacementPool[day]);
  }

  // Deduplicate
  const seen = new Set<string>();
  const uniqueMeals = allMeals.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  // Score each meal
  const scored = uniqueMeals.map((meal) => {
    const matchedIngredients: string[] = [];
    for (const ing of meal.ingredients) {
      const ingName = ing.name.toLowerCase();
      if (leftoverNames.has(ingName)) {
        matchedIngredients.push(ing.name);
      }
      // Partial match
      for (const leftoverName of leftoverNames) {
        if (ingName.includes(leftoverName) || leftoverName.includes(ingName)) {
          if (!matchedIngredients.includes(ing.name)) {
            matchedIngredients.push(ing.name);
          }
        }
      }
    }
    return { meal, matchCount: matchedIngredients.length, matchedIngredients };
  });

  // Return only meals with at least one match, sorted by match count desc
  return scored
    .filter((s) => s.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount);
}
