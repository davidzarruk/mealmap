import { supabase } from './supabase';
import { DayKey, MealCard, WeekMealsMap, dayTabs, IngredientItem } from '../data/plan';

// ─── Types matching Supabase schema ───

type PlanRow = {
  id: string;
  user_id: string;
  horizon: string;
  people_count: number;
  meal_types: string[];
  cooking_level: string;
  max_time_minutes: number;
  region: string;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

type PlanSlotRow = {
  id: string;
  plan_id: string;
  day_index: number;
  meal_type: string;
  approved_meal_candidate_id: string | null;
  approved_at: string | null;
};

type MealCandidateRow = {
  id: string;
  slot_id: string;
  title: string;
  ingredients_json: IngredientItem[];
  prep_steps_short: string | null;
  est_time_minutes: number | null;
  tags: string[];
  dietary_tags: string[];
  source: string;
  is_current: boolean;
  created_at: string;
};

// ─── Helpers ───

const DAY_INDEX_MAP: Record<DayKey, number> = {
  Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
};

const INDEX_DAY_MAP: Record<number, DayKey> = Object.fromEntries(
  Object.entries(DAY_INDEX_MAP).map(([k, v]) => [v, k as DayKey]),
) as Record<number, DayKey>;

function mealCardFromCandidate(row: MealCandidateRow): MealCard {
  return {
    id: row.id,
    title: row.title,
    prepTimeMin: row.est_time_minutes ?? 30,
    level: (row.tags.find((t) => ['Beginner', 'Intermediate', 'Advanced'].includes(t)) as MealCard['level']) ?? 'Beginner',
    ingredients: row.ingredients_json ?? [],
    shortPrep: row.prep_steps_short ?? '',
  };
}

// ─── F7-001: Save/load meals to Supabase ───

export async function saveMealsToSupabase(
  planId: string,
  weekMeals: WeekMealsMap,
  approvedIds: string[],
): Promise<void> {
  for (const day of dayTabs) {
    const dayIndex = DAY_INDEX_MAP[day];
    const meals = weekMeals[day];

    for (const meal of meals) {
      // Upsert slot
      const { data: slotData, error: slotError } = await supabase
        .from('plan_slots')
        .upsert(
          {
            plan_id: planId,
            day_index: dayIndex,
            meal_type: 'lunch',
          },
          { onConflict: 'plan_id,day_index,meal_type' },
        )
        .select('id')
        .single();

      if (slotError || !slotData) continue;

      // Upsert meal candidate
      const isApproved = approvedIds.includes(meal.id);
      const { error: mcError } = await supabase.from('meal_candidates').upsert({
        id: meal.id,
        slot_id: slotData.id,
        title: meal.title,
        ingredients_json: meal.ingredients,
        prep_steps_short: meal.shortPrep,
        est_time_minutes: meal.prepTimeMin,
        tags: [meal.level],
        source: 'seed',
        is_current: true,
      });

      if (mcError) continue;

      // If approved, update slot
      if (isApproved) {
        await supabase
          .from('plan_slots')
          .update({
            approved_meal_candidate_id: meal.id,
            approved_at: new Date().toISOString(),
          })
          .eq('id', slotData.id);
      }
    }
  }
}

// ─── F7-002: Save/load weekly plan to Supabase ───

export async function createOrGetCurrentPlan(): Promise<PlanRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Try to get the latest in_progress plan
  const { data: existing } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['draft', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) return existing as PlanRow;

  // Create new plan
  const { data: newPlan, error } = await supabase
    .from('plans')
    .insert({
      user_id: user.id,
      horizon: 'week',
      people_count: 2,
      meal_types: ['lunch'],
      cooking_level: 'easy',
      max_time_minutes: 30,
      region: 'CO',
      status: 'in_progress',
    })
    .select('*')
    .single();

  if (error) return null;
  return newPlan as PlanRow;
}

export async function loadWeekPlanFromSupabase(planId: string): Promise<{ weekMeals: WeekMealsMap; approvedIds: string[] } | null> {
  const { data: slots } = await supabase
    .from('plan_slots')
    .select('*, meal_candidates(*)')
    .eq('plan_id', planId);

  if (!slots || slots.length === 0) return null;

  const weekMeals: WeekMealsMap = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };
  const approvedIds: string[] = [];

  for (const slot of slots as (PlanSlotRow & { meal_candidates: MealCandidateRow[] })[]) {
    const day = INDEX_DAY_MAP[slot.day_index];
    if (!day) continue;

    const currentCandidates = (slot.meal_candidates || []).filter((mc) => mc.is_current);
    for (const mc of currentCandidates) {
      weekMeals[day].push(mealCardFromCandidate(mc));
      if (slot.approved_meal_candidate_id === mc.id) {
        approvedIds.push(mc.id);
      }
    }
  }

  return { weekMeals, approvedIds };
}

export async function completePlan(planId: string): Promise<void> {
  await supabase
    .from('plans')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', planId);
}

// ─── F7-002: Get plan history ───

export async function getPlanHistory(limit = 10): Promise<PlanRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(limit);

  return (data ?? []) as PlanRow[];
}

// ─── F7-003: Shopping list persistence ───

export async function saveShoppingListToSupabase(
  planId: string,
  items: Array<{ name: string; amount: number; unit: string; category: string; checked: boolean }>,
): Promise<void> {
  // Upsert shopping list
  const { data: list, error: listError } = await supabase
    .from('shopping_lists')
    .upsert({ plan_id: planId }, { onConflict: 'plan_id' })
    .select('id')
    .single();

  if (listError || !list) return;

  // Delete existing items and re-insert
  await supabase.from('shopping_items').delete().eq('shopping_list_id', list.id);

  if (items.length === 0) return;

  const rows = items.map((item) => ({
    shopping_list_id: list.id,
    ingredient_name: item.name,
    unit: item.unit,
    total_qty: item.amount,
    category: item.category.toLowerCase(),
    checked: item.checked,
  }));

  await supabase.from('shopping_items').insert(rows);
}

export type ShoppingItemRow = {
  id: string;
  shopping_list_id: string;
  ingredient_name: string;
  unit: string | null;
  total_qty: number | null;
  category: string;
  checked: boolean;
};

export async function loadShoppingListFromSupabase(planId: string): Promise<ShoppingItemRow[] | null> {
  const { data: list } = await supabase
    .from('shopping_lists')
    .select('id')
    .eq('plan_id', planId)
    .single();

  if (!list) return null;

  const { data: items } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('shopping_list_id', list.id)
    .order('category')
    .order('ingredient_name');

  return (items ?? []) as ShoppingItemRow[];
}

export async function toggleShoppingItemChecked(itemId: string, checked: boolean): Promise<void> {
  await supabase.from('shopping_items').update({ checked }).eq('id', itemId);
}

// ─── F7-005: Meal ratings ───

export async function rateMeal(mealCandidateId: string, rating: -1 | 1): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('meal_ratings').upsert(
    {
      user_id: user.id,
      meal_candidate_id: mealCandidateId,
      rating,
    },
    { onConflict: 'user_id,meal_candidate_id' },
  );
}

export async function getMealRatings(): Promise<Record<string, -1 | 1>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from('meal_ratings')
    .select('meal_candidate_id, rating')
    .eq('user_id', user.id);

  const map: Record<string, -1 | 1> = {};
  for (const row of data ?? []) {
    map[row.meal_candidate_id] = row.rating as -1 | 1;
  }
  return map;
}

// ─── F7-006: Dietary filters ───

export const DIETARY_TAGS = ['vegetarian', 'gluten-free', 'high-protein', 'low-carb', 'dairy-free', 'vegan'] as const;
export type DietaryTag = (typeof DIETARY_TAGS)[number];

export async function getUserDietaryFilters(): Promise<DietaryTag[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('user_dietary_filters')
    .select('tag')
    .eq('user_id', user.id);

  return (data ?? []).map((r) => r.tag as DietaryTag);
}

export async function setUserDietaryFilters(tags: DietaryTag[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Delete all existing
  await supabase.from('user_dietary_filters').delete().eq('user_id', user.id);

  if (tags.length === 0) return;

  await supabase.from('user_dietary_filters').insert(
    tags.map((tag) => ({ user_id: user.id!, tag })),
  );
}
