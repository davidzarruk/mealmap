/**
 * F9-001: Nutritional Estimation Service
 *
 * Local estimator based on average nutritional data per ingredient category.
 * No external API required — uses a built-in database of common ingredients.
 */

import { IngredientItem } from '../data/plan';

// ─── Types ───

export type NutritionInfo = {
  calories: number;   // kcal
  protein: number;    // grams
  carbs: number;      // grams
  fat: number;        // grams
  fiber: number;      // grams
};

export type MealNutrition = NutritionInfo & {
  perServing: NutritionInfo;
  servings: number;
  confidence: 'high' | 'medium' | 'low';
};

// ─── Nutritional Database (per 100g or per unit) ───

type NutrientEntry = {
  per: 'g' | 'ml' | 'unit' | 'can' | 'clove';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

const NUTRIENT_DB: Record<string, NutrientEntry> = {
  // Proteins
  'chicken breast':   { per: 'g', calories: 1.65, protein: 0.31, carbs: 0, fat: 0.036, fiber: 0 },
  'chicken thigh':    { per: 'g', calories: 2.09, protein: 0.26, carbs: 0, fat: 0.109, fiber: 0 },
  'ground chicken':   { per: 'g', calories: 1.43, protein: 0.27, carbs: 0, fat: 0.03, fiber: 0 },
  'beef':             { per: 'g', calories: 2.50, protein: 0.26, carbs: 0, fat: 0.15, fiber: 0 },
  'ground beef':      { per: 'g', calories: 2.50, protein: 0.26, carbs: 0, fat: 0.15, fiber: 0 },
  'turkey slices':    { per: 'g', calories: 1.04, protein: 0.18, carbs: 0.04, fat: 0.02, fiber: 0 },
  'tilapia fillet':   { per: 'g', calories: 0.96, protein: 0.20, carbs: 0, fat: 0.017, fiber: 0 },
  'tuna':             { per: 'can', calories: 180, protein: 40, carbs: 0, fat: 1.5, fiber: 0 },
  'seafood mix':      { per: 'g', calories: 0.85, protein: 0.17, carbs: 0.02, fat: 0.01, fiber: 0 },
  'egg':              { per: 'unit', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0 },

  // Grains & Pantry
  'rice':             { per: 'g', calories: 1.30, protein: 0.027, carbs: 0.28, fat: 0.003, fiber: 0.004 },
  'pasta':            { per: 'g', calories: 1.31, protein: 0.05, carbs: 0.25, fat: 0.011, fiber: 0.018 },
  'lentils':          { per: 'g', calories: 1.16, protein: 0.09, carbs: 0.20, fat: 0.004, fiber: 0.08 },
  'beans':            { per: 'g', calories: 1.27, protein: 0.09, carbs: 0.225, fat: 0.005, fiber: 0.065 },
  'chickpeas':        { per: 'g', calories: 1.64, protein: 0.089, carbs: 0.27, fat: 0.026, fiber: 0.076 },
  'quinoa':           { per: 'g', calories: 1.20, protein: 0.044, carbs: 0.214, fat: 0.019, fiber: 0.028 },
  'tortillas':        { per: 'unit', calories: 150, protein: 4, carbs: 26, fat: 3.5, fiber: 1.5 },
  'tortilla wrap':    { per: 'unit', calories: 150, protein: 4, carbs: 26, fat: 3.5, fiber: 1.5 },
  'burger buns':      { per: 'unit', calories: 140, protein: 4, carbs: 26, fat: 2, fiber: 1 },
  'arepa':            { per: 'unit', calories: 200, protein: 4, carbs: 38, fat: 3, fiber: 2 },
  'pre-cooked corn flour': { per: 'g', calories: 3.62, protein: 0.07, carbs: 0.79, fat: 0.015, fiber: 0.05 },
  'tomato sauce':     { per: 'ml', calories: 0.29, protein: 0.012, carbs: 0.058, fat: 0.002, fiber: 0.012 },
  'soy sauce':        { per: 'ml', calories: 0.53, protein: 0.081, carbs: 0.049, fat: 0.001, fiber: 0 },
  'coconut milk':     { per: 'ml', calories: 1.97, protein: 0.022, carbs: 0.027, fat: 0.214, fiber: 0 },

  // Produce
  'potato':           { per: 'g', calories: 0.77, protein: 0.02, carbs: 0.17, fat: 0.001, fiber: 0.022 },
  'tomato':           { per: 'unit', calories: 22, protein: 1.1, carbs: 4.8, fat: 0.25, fiber: 1.5 },
  'onion':            { per: 'unit', calories: 44, protein: 1.2, carbs: 10.3, fat: 0.1, fiber: 1.4 },
  'carrot':           { per: 'unit', calories: 25, protein: 0.6, carbs: 5.8, fat: 0.15, fiber: 1.7 },
  'avocado':          { per: 'unit', calories: 240, protein: 3, carbs: 12.8, fat: 22, fiber: 10 },
  'corn':             { per: 'unit', calories: 88, protein: 3.3, carbs: 19, fat: 1.4, fiber: 2 },
  'sweet corn':       { per: 'g', calories: 0.86, protein: 0.032, carbs: 0.187, fat: 0.012, fiber: 0.02 },
  'lemon':            { per: 'unit', calories: 17, protein: 0.6, carbs: 5.4, fat: 0.2, fiber: 1.6 },
  'garlic':           { per: 'clove', calories: 4, protein: 0.2, carbs: 1, fat: 0.02, fiber: 0.06 },
  'lettuce':          { per: 'unit', calories: 15, protein: 1.3, carbs: 2.2, fat: 0.2, fiber: 1.3 },
  'spinach':          { per: 'g', calories: 0.23, protein: 0.029, carbs: 0.036, fat: 0.004, fiber: 0.022 },
  'bell pepper':      { per: 'unit', calories: 30, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
  'peas':             { per: 'g', calories: 0.81, protein: 0.055, carbs: 0.144, fat: 0.004, fiber: 0.05 },
  'broccoli':         { per: 'g', calories: 0.34, protein: 0.028, carbs: 0.066, fat: 0.004, fiber: 0.026 },
  'mixed vegetables': { per: 'g', calories: 0.65, protein: 0.026, carbs: 0.13, fat: 0.003, fiber: 0.04 },
  'plantain':         { per: 'unit', calories: 220, protein: 2.3, carbs: 57, fat: 0.7, fiber: 3.4 },
  'yuca':             { per: 'g', calories: 1.60, protein: 0.014, carbs: 0.38, fat: 0.003, fiber: 0.018 },
  'celery':           { per: 'g', calories: 0.16, protein: 0.007, carbs: 0.03, fat: 0.002, fiber: 0.016 },
  'pumpkin':          { per: 'g', calories: 0.26, protein: 0.01, carbs: 0.065, fat: 0.001, fiber: 0.005 },
  'rosemary':         { per: 'g', calories: 1.31, protein: 0.033, carbs: 0.207, fat: 0.059, fiber: 0.143 },
  'basil':            { per: 'g', calories: 0.23, protein: 0.032, carbs: 0.026, fat: 0.006, fiber: 0.016 },

  // Dairy
  'cheese':           { per: 'g', calories: 4.02, protein: 0.25, carbs: 0.013, fat: 0.33, fiber: 0 },
  'milk':             { per: 'ml', calories: 0.42, protein: 0.034, carbs: 0.05, fat: 0.01, fiber: 0 },
};

// ─── Fallback by category ───

const CATEGORY_FALLBACK: Record<string, NutrientEntry> = {
  'Produce':  { per: 'g', calories: 0.45, protein: 0.02, carbs: 0.09, fat: 0.003, fiber: 0.025 },
  'Protein':  { per: 'g', calories: 1.80, protein: 0.25, carbs: 0.01, fat: 0.08, fiber: 0 },
  'Pantry':   { per: 'g', calories: 1.50, protein: 0.06, carbs: 0.25, fat: 0.01, fiber: 0.03 },
  'Dairy':    { per: 'g', calories: 2.00, protein: 0.10, carbs: 0.05, fat: 0.15, fiber: 0 },
};

// ─── Estimation Logic ───

function normalizeAmount(amount: number, unit: string, dbEntry: NutrientEntry): number {
  // Convert to the unit expected by the DB entry
  if (dbEntry.per === 'unit' || dbEntry.per === 'can' || dbEntry.per === 'clove') {
    return amount; // already in units
  }
  // per 'g' or 'ml' — amount is already in g or ml
  return amount;
}

function estimateIngredientNutrition(ingredient: IngredientItem): { nutrition: NutritionInfo; matched: boolean } {
  const key = ingredient.name.toLowerCase();
  const entry = NUTRIENT_DB[key];

  if (entry) {
    const qty = normalizeAmount(ingredient.amount, ingredient.unit, entry);
    return {
      nutrition: {
        calories: Math.round(entry.calories * qty),
        protein: Math.round(entry.protein * qty * 10) / 10,
        carbs: Math.round(entry.carbs * qty * 10) / 10,
        fat: Math.round(entry.fat * qty * 10) / 10,
        fiber: Math.round(entry.fiber * qty * 10) / 10,
      },
      matched: true,
    };
  }

  // Fallback by category
  const fallback = CATEGORY_FALLBACK[ingredient.category] ?? CATEGORY_FALLBACK['Pantry'];
  // For unit-based items without DB entry, estimate ~150g per unit
  const estimatedGrams = ['unit', 'can', 'clove'].includes(ingredient.unit)
    ? ingredient.amount * 150
    : ingredient.amount;

  return {
    nutrition: {
      calories: Math.round(fallback.calories * estimatedGrams),
      protein: Math.round(fallback.protein * estimatedGrams * 10) / 10,
      carbs: Math.round(fallback.carbs * estimatedGrams * 10) / 10,
      fat: Math.round(fallback.fat * estimatedGrams * 10) / 10,
      fiber: Math.round(fallback.fiber * estimatedGrams * 10) / 10,
    },
    matched: false,
  };
}

export function estimateMealNutrition(
  ingredients: IngredientItem[],
  servings: number = 2,
): MealNutrition {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let matchedCount = 0;

  for (const ing of ingredients) {
    const { nutrition, matched } = estimateIngredientNutrition(ing);
    totalCalories += nutrition.calories;
    totalProtein += nutrition.protein;
    totalCarbs += nutrition.carbs;
    totalFat += nutrition.fat;
    totalFiber += nutrition.fiber;
    if (matched) matchedCount++;
  }

  const matchRatio = ingredients.length > 0 ? matchedCount / ingredients.length : 0;
  const confidence: MealNutrition['confidence'] =
    matchRatio >= 0.8 ? 'high' : matchRatio >= 0.5 ? 'medium' : 'low';

  const total: NutritionInfo = {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10,
  };

  const perServing: NutritionInfo = {
    calories: Math.round(totalCalories / servings),
    protein: Math.round((totalProtein / servings) * 10) / 10,
    carbs: Math.round((totalCarbs / servings) * 10) / 10,
    fat: Math.round((totalFat / servings) * 10) / 10,
    fiber: Math.round((totalFiber / servings) * 10) / 10,
  };

  return { ...total, perServing, servings, confidence };
}

// ─── Daily Summary ───

export type DailyNutritionSummary = NutritionInfo & {
  mealCount: number;
};

export function estimateDailyNutrition(
  meals: Array<{ ingredients: IngredientItem[] }>,
  servings: number = 2,
): DailyNutritionSummary {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  for (const meal of meals) {
    const nutrition = estimateMealNutrition(meal.ingredients, servings);
    totalCalories += nutrition.perServing.calories;
    totalProtein += nutrition.perServing.protein;
    totalCarbs += nutrition.perServing.carbs;
    totalFat += nutrition.perServing.fat;
    totalFiber += nutrition.perServing.fiber;
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10,
    mealCount: meals.length,
  };
}
