/**
 * F9-003: Meal Prep Mode
 *
 * Groups meals by shared ingredients and suggests batch cooking order.
 */

import { DayKey, dayTabs, MealCard, WeekMealsMap } from '../data/plan';

// ─── Types ───

export type MealPrepGroup = {
  sharedIngredients: string[];
  meals: Array<{ day: DayKey; meal: MealCard }>;
  totalPrepTime: number;
  suggestedOrder: number;
};

export type MealPrepPlan = {
  groups: MealPrepGroup[];
  totalPrepTime: number;
  timeSaved: number; // estimated minutes saved by batching
};

// ─── Logic ───

function getMealIngredientNames(meal: MealCard): string[] {
  return meal.ingredients.map((i) => i.name.toLowerCase());
}

function findSharedIngredients(a: string[], b: string[]): string[] {
  return a.filter((ing) => b.includes(ing));
}

export function generateMealPrepPlan(
  weekMeals: WeekMealsMap,
  approvedIds: string[],
): MealPrepPlan {
  // Collect all approved meals with their day
  const allMeals: Array<{ day: DayKey; meal: MealCard }> = [];
  for (const day of dayTabs) {
    for (const meal of weekMeals[day]) {
      if (approvedIds.includes(meal.id)) {
        allMeals.push({ day, meal });
      }
    }
  }

  if (allMeals.length === 0) {
    return { groups: [], totalPrepTime: 0, timeSaved: 0 };
  }

  // Build adjacency: which meals share ingredients
  const assigned = new Set<string>();
  const groups: MealPrepGroup[] = [];

  for (let i = 0; i < allMeals.length; i++) {
    if (assigned.has(allMeals[i].meal.id)) continue;

    const groupMeals = [allMeals[i]];
    assigned.add(allMeals[i].meal.id);
    const baseIngredients = getMealIngredientNames(allMeals[i].meal);
    const shared = new Set<string>();

    for (let j = i + 1; j < allMeals.length; j++) {
      if (assigned.has(allMeals[j].meal.id)) continue;
      const otherIngredients = getMealIngredientNames(allMeals[j].meal);
      const common = findSharedIngredients(baseIngredients, otherIngredients);
      if (common.length >= 1) {
        groupMeals.push(allMeals[j]);
        assigned.add(allMeals[j].meal.id);
        common.forEach((ing) => shared.add(ing));
      }
    }

    const totalPrepTime = groupMeals.reduce((acc, m) => acc + m.meal.prepTimeMin, 0);

    groups.push({
      sharedIngredients: Array.from(shared),
      meals: groupMeals,
      totalPrepTime,
      suggestedOrder: 0,
    });
  }

  // Sort groups: largest first (most batching benefit), then assign order
  groups.sort((a, b) => b.meals.length - a.meals.length);
  groups.forEach((g, i) => { g.suggestedOrder = i + 1; });

  // Estimate time saved: ~15% per shared-ingredient meal beyond the first
  const totalPrepTime = groups.reduce((acc, g) => acc + g.totalPrepTime, 0);
  const batchedMeals = groups.reduce((acc, g) => acc + Math.max(0, g.meals.length - 1), 0);
  const timeSaved = Math.round(batchedMeals * 8); // ~8 min saved per batched meal

  return { groups, totalPrepTime, timeSaved };
}
