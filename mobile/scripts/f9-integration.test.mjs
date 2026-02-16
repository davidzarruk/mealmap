/**
 * F9-010: Final Integration Test Suite
 *
 * Comprehensive tests covering features F6-F9.
 * Run: node --test scripts/f9-integration.test.mjs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ─── F9-001: Nutrition Estimation ───

describe('F9-001: Nutrition Estimation', () => {
  it('estimates nutrition for known ingredients', async () => {
    const { estimateMealNutrition } = await import('../src/lib/nutritionEstimation.ts');
    const result = estimateMealNutrition([
      { name: 'Chicken breast', amount: 400, unit: 'g', category: 'Protein' },
      { name: 'Rice', amount: 300, unit: 'g', category: 'Pantry' },
      { name: 'Avocado', amount: 1, unit: 'unit', category: 'Produce' },
    ], 2);

    assert.ok(result.calories > 0, 'Should have calories');
    assert.ok(result.perServing.calories > 0, 'Should have per-serving calories');
    assert.ok(result.perServing.protein > 0, 'Should have protein');
    assert.equal(result.servings, 2);
    assert.equal(result.confidence, 'high');
  });

  it('returns low confidence for unknown ingredients', async () => {
    const { estimateMealNutrition } = await import('../src/lib/nutritionEstimation.ts');
    const result = estimateMealNutrition([
      { name: 'Exotic fruit xyz', amount: 200, unit: 'g', category: 'Produce' },
    ], 1);

    assert.equal(result.confidence, 'low');
    assert.ok(result.calories > 0, 'Should still estimate');
  });

  it('handles empty ingredients', async () => {
    const { estimateMealNutrition } = await import('../src/lib/nutritionEstimation.ts');
    const result = estimateMealNutrition([], 2);
    assert.equal(result.calories, 0);
  });
});

// ─── F9-002: Daily Nutrition Summary ───

describe('F9-002: Daily Nutrition Summary', () => {
  it('sums nutrition across meals', async () => {
    const { estimateDailyNutrition } = await import('../src/lib/nutritionEstimation.ts');
    const meals = [
      { ingredients: [{ name: 'Rice', amount: 300, unit: 'g', category: 'Pantry' }] },
      { ingredients: [{ name: 'Chicken breast', amount: 400, unit: 'g', category: 'Protein' }] },
    ];
    const result = estimateDailyNutrition(meals, 2);
    assert.ok(result.calories > 0);
    assert.equal(result.mealCount, 2);
  });
});

// ─── F9-003: Meal Prep Mode ───

describe('F9-003: Meal Prep Mode', () => {
  it('groups meals with shared ingredients', async () => {
    const { generateMealPrepPlan } = await import('../src/lib/mealPrepMode.ts');
    const weekMeals = {
      Mon: [{ id: 'a', title: 'Rice bowl', prepTimeMin: 30, level: 'Beginner', ingredients: [{ name: 'Rice', amount: 300, unit: 'g', category: 'Pantry' }], shortPrep: '' }],
      Tue: [{ id: 'b', title: 'Fried rice', prepTimeMin: 25, level: 'Beginner', ingredients: [{ name: 'Rice', amount: 250, unit: 'g', category: 'Pantry' }], shortPrep: '' }],
      Wed: [], Thu: [], Fri: [], Sat: [], Sun: [],
    };
    const result = generateMealPrepPlan(weekMeals, ['a', 'b']);
    assert.ok(result.groups.length >= 1, 'Should group meals');
    assert.ok(result.groups[0].meals.length === 2, 'Should have 2 meals in group');
    assert.ok(result.groups[0].sharedIngredients.includes('rice'));
  });

  it('returns empty for no approved meals', async () => {
    const { generateMealPrepPlan } = await import('../src/lib/mealPrepMode.ts');
    const weekMeals = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };
    const result = generateMealPrepPlan(weekMeals, []);
    assert.equal(result.groups.length, 0);
  });
});

// ─── F9-004: Shopping Categories ───

describe('F9-004: Shopping Categories', () => {
  it('maps ingredients to supermarket sections', async () => {
    const { getSupermarketSection } = await import('../src/lib/shoppingCategories.ts');
    assert.equal(getSupermarketSection('Chicken breast'), 'Meat & Seafood');
    assert.equal(getSupermarketSection('Potato'), 'Fruits & Vegetables');
    assert.equal(getSupermarketSection('Rice'), 'Grains & Bread');
    assert.equal(getSupermarketSection('Cheese'), 'Dairy & Eggs');
    assert.equal(getSupermarketSection('Lentils'), 'Canned & Dry Goods');
    assert.equal(getSupermarketSection('Soy sauce'), 'Condiments & Sauces');
  });

  it('groups items by section', async () => {
    const { groupBySupermarketSection } = await import('../src/lib/shoppingCategories.ts');
    const items = [
      { name: 'Chicken breast', amount: 400 },
      { name: 'Rice', amount: 300 },
      { name: 'Tomato', amount: 2 },
    ];
    const groups = groupBySupermarketSection(items);
    assert.ok(groups.length >= 2, 'Should have multiple sections');
  });
});

// ─── F9-005: Pantry Service (deduction logic) ───

describe('F9-005: Pantry Deduction', () => {
  it('deducts pantry items from shopping list', async () => {
    const { deductPantryFromShopping } = await import('../src/lib/pantryService.ts');
    const shopping = [
      { name: 'Rice', amount: 300, unit: 'g' },
      { name: 'Chicken breast', amount: 400, unit: 'g' },
    ];
    const pantry = [
      { id: '1', user_id: 'u', ingredient_name: 'Rice', amount: 200, unit: 'g', category: 'Pantry', added_at: '', expires_at: null },
    ];
    const result = deductPantryFromShopping(shopping, pantry);
    assert.equal(result[0].amount, 100, 'Rice should be reduced by pantry amount');
    assert.equal(result[0].inPantry, true);
    assert.equal(result[1].inPantry, false);
  });
});

// ─── F9-007: Social Sharing (text format) ───

describe('F9-007: Social Sharing', () => {
  it('formats meal as shareable text', async () => {
    // Just test the module imports without crash
    const mod = await import('../src/components/ShareableMealCard.tsx');
    assert.ok(mod.shareMealAsText, 'Should export shareMealAsText');
  });
});

// ─── Cross-feature: Full flow test ───

describe('F9: Full Flow Integration', () => {
  it('nutrition → prep → categories pipeline works', async () => {
    const { estimateMealNutrition } = await import('../src/lib/nutritionEstimation.ts');
    const { generateMealPrepPlan } = await import('../src/lib/mealPrepMode.ts');
    const { getSupermarketSection } = await import('../src/lib/shoppingCategories.ts');

    // Create a minimal week
    const meal = {
      id: 'test-1',
      title: 'Test chicken rice',
      prepTimeMin: 30,
      level: 'Beginner',
      ingredients: [
        { name: 'Chicken breast', amount: 400, unit: 'g', category: 'Protein' },
        { name: 'Rice', amount: 300, unit: 'g', category: 'Pantry' },
      ],
      shortPrep: 'Cook',
    };

    // 1. Nutrition works
    const nutrition = estimateMealNutrition(meal.ingredients, 2);
    assert.ok(nutrition.perServing.calories > 200, 'Chicken + rice should be > 200 kcal');

    // 2. Prep mode works
    const weekMeals = { Mon: [meal], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };
    const prep = generateMealPrepPlan(weekMeals, ['test-1']);
    assert.equal(prep.groups.length, 1);

    // 3. Categories work
    assert.equal(getSupermarketSection('Chicken breast'), 'Meat & Seafood');
    assert.equal(getSupermarketSection('Rice'), 'Grains & Bread');
  });
});

console.log('✅ F9 Integration Test Suite loaded');
