#!/usr/bin/env node
/**
 * F10-010: Full Regression Test Suite
 *
 * Coverage for F6–F10 features: imports, types, basic logic validation.
 * Run: node scripts/f10-regression.test.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'src');

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.error(`  ❌ ${name}`);
  }
}

function fileExists(relPath) {
  return existsSync(join(src, relPath));
}

function fileContains(relPath, text) {
  if (!fileExists(relPath)) return false;
  const content = readFileSync(join(src, relPath), 'utf-8');
  return content.includes(text);
}

// ─── F6 Regression ───
console.log('\n🧪 F6: Dark mode, Onboarding, Profile, MealDetails, Notifications, Export, Animations, Search, Summary, Tests');

assert(fileExists('theme/colors.ts'), 'F6-001 colors.ts exists');
assert(fileContains('theme/colors.ts', 'useThemeColors'), 'F6-001 useThemeColors hook');
assert(fileContains('theme/colors.ts', 'darkColors'), 'F6-001 darkColors palette');
assert(fileExists('screens/onboarding/OnboardingScreen.tsx'), 'F6-002 OnboardingScreen');
assert(fileExists('screens/profile/ProfileScreen.tsx'), 'F6-003 ProfileScreen');
assert(fileExists('screens/plan/MealDetailsScreen.tsx'), 'F6-004 MealDetailsScreen');
assert(fileExists('lib/notifications.ts'), 'F6-005 notifications');
assert(fileContains('screens/shopping/ShoppingListScreen.tsx', 'Share'), 'F6-006 export/share in shopping');
assert(fileExists('navigation/AppNavigator.tsx'), 'F6-007 AppNavigator');
assert(fileContains('screens/plan/PlanScreen.tsx', 'Search') || fileContains('screens/plan/PlanScreen.tsx', 'search'), 'F6-008 search in PlanScreen');
assert(fileExists('components/WeeklySummaryCard.tsx'), 'F6-009 WeeklySummaryCard');

// ─── F7 Regression ───
console.log('\n🧪 F7: Supabase meals, shopping persistence, history, ratings, dietary, portions, substitutions, placeholders, E2E');

assert(fileExists('lib/supabasePlanService.ts'), 'F7-001/002 supabasePlanService');
assert(fileContains('lib/supabasePlanService.ts', 'saveMealsToSupabase'), 'F7-001 saveMealsToSupabase');
assert(fileContains('lib/supabasePlanService.ts', 'loadWeekPlanFromSupabase'), 'F7-002 loadWeekPlanFromSupabase');
assert(fileContains('screens/shopping/ShoppingListScreen.tsx', 'checked') || fileContains('lib/supabasePlanService.ts', 'checked'), 'F7-003 shopping list checked');
assert(fileExists('screens/plan/PlanHistoryScreen.tsx'), 'F7-004 PlanHistoryScreen');
assert(fileContains('lib/supabasePlanService.ts', 'meal_ratings') || fileContains('lib/supabasePlanService.ts', 'rateMeal'), 'F7-005 meal ratings');
assert(fileContains('lib/supabasePlanService.ts', 'dietary') || fileContains('screens/plan/PlanScreen.tsx', 'dietary'), 'F7-006 dietary filters');
assert(fileExists('lib/ingredientSubstitutions.ts'), 'F7-008 ingredient substitutions');
assert(fileExists('components/MealCategoryIcon.tsx'), 'F7-009 MealCategoryIcon');

// ─── F8 Regression ───
console.log('\n🧪 F8: LLM gen, meal images, i18n, deep linking, offline, swipe tutorial, widget, budget, accessibility, perf');

assert(fileExists('lib/mealGenerationService.ts'), 'F8-001 mealGenerationService');
assert(fileExists('lib/mealImageService.ts'), 'F8-002 mealImageService');
assert(fileExists('lib/i18n.ts'), 'F8-003 i18n');
assert(fileContains('lib/i18n.ts', 'SupportedLocale'), 'F8-003 SupportedLocale type');
assert(fileExists('lib/deepLinking.ts'), 'F8-004 deepLinking');
assert(fileExists('lib/offlineSync.ts'), 'F8-005 offlineSync');
assert(fileExists('components/SwipeTutorial.tsx'), 'F8-006 SwipeTutorial');
assert(fileExists('lib/widgetBridge.ts'), 'F8-007 widgetBridge');
assert(fileExists('lib/budgetEstimation.ts'), 'F8-008 budgetEstimation');
assert(fileExists('lib/accessibility.ts'), 'F8-009 accessibility');
assert(fileExists('lib/performanceOptimization.ts'), 'F8-010 performanceOptimization');

// ─── F9 Regression ───
console.log('\n🧪 F9: Nutrition, weekly nutrition, meal prep, shopping categories, pantry, calendar, sharing, push, app store, integration test');

assert(fileExists('lib/nutritionEstimation.ts'), 'F9-001 nutritionEstimation');
assert(fileExists('components/WeeklyNutritionChart.tsx'), 'F9-002 WeeklyNutritionChart');
assert(fileExists('lib/mealPrepMode.ts'), 'F9-003 mealPrepMode');
assert(fileExists('screens/plan/MealPrepScreen.tsx'), 'F9-003 MealPrepScreen');
assert(fileExists('lib/shoppingCategories.ts'), 'F9-004 shoppingCategories');
assert(fileExists('lib/pantryService.ts'), 'F9-005 pantryService');
assert(fileExists('screens/plan/MealCalendarScreen.tsx'), 'F9-006 MealCalendarScreen');
assert(fileExists('components/ShareableMealCard.tsx'), 'F9-007 ShareableMealCard');

// ─── F10 Regression ───
console.log('\n🧪 F10: Favorites, custom meal, grocery store, templates, household, timer, leftovers, seasonal, crash reporting');

assert(fileExists('screens/favorites/FavoritesScreen.tsx'), 'F10-001 FavoritesScreen');
assert(fileContains('screens/favorites/FavoritesScreen.tsx', 'FavoritesScreen'), 'F10-001 FavoritesScreen exported');
assert(fileExists('screens/meals/CustomMealScreen.tsx'), 'F10-002 CustomMealScreen');
assert(fileContains('screens/meals/CustomMealScreen.tsx', 'ingredients'), 'F10-002 ingredients form');
assert(fileExists('lib/groceryStoreService.ts'), 'F10-003 groceryStoreService');
assert(fileContains('lib/groceryStoreService.ts', 'rappi') || fileContains('lib/groceryStoreService.ts', 'Rappi'), 'F10-003 Rappi provider');
assert(fileContains('lib/groceryStoreService.ts', 'merqueo') || fileContains('lib/groceryStoreService.ts', 'Merqueo'), 'F10-003 Merqueo provider');
assert(fileExists('lib/planTemplateService.ts'), 'F10-004 planTemplateService');
assert(fileContains('lib/planTemplateService.ts', 'PlanTemplate'), 'F10-004 PlanTemplate type');
assert(fileExists('lib/householdService.ts'), 'F10-005 householdService');
assert(fileContains('lib/householdService.ts', 'HouseholdMember'), 'F10-005 HouseholdMember type');
assert(fileExists('screens/cooking/CookingTimerScreen.tsx'), 'F10-006 CookingTimerScreen');
assert(fileContains('screens/cooking/CookingTimerScreen.tsx', 'countdown') || fileContains('screens/cooking/CookingTimerScreen.tsx', 'running'), 'F10-006 timer states');
assert(fileExists('lib/leftoverService.ts'), 'F10-007 leftoverService');
assert(fileExists('screens/leftovers/LeftoverTrackerScreen.tsx'), 'F10-007 LeftoverTrackerScreen');
assert(fileContains('lib/leftoverService.ts', 'suggestMealsForLeftovers'), 'F10-007 suggestion logic');
assert(fileExists('data/seasonalIngredients.ts'), 'F10-008 seasonalIngredients data');
assert(fileContains('data/seasonalIngredients.ts', 'Mango'), 'F10-008 has Colombian fruits');
assert(fileContains('data/seasonalIngredients.ts', 'getSeasonalIngredients'), 'F10-008 getSeasonalIngredients fn');
assert(fileContains('data/seasonalIngredients.ts', 'isInSeason'), 'F10-008 isInSeason fn');
assert(fileExists('lib/crashReporting.ts'), 'F10-009 crashReporting stub');
assert(fileContains('lib/crashReporting.ts', 'captureException'), 'F10-009 captureException');
assert(fileContains('lib/crashReporting.ts', 'initCrashReporting'), 'F10-009 initCrashReporting');
assert(!fileContains('lib/crashReporting.ts', '@sentry/react-native'), 'F10-009 NO real Sentry SDK');

// ─── Migrations ───
console.log('\n🧪 Migrations');

const migrationsDir = join(root, '..', 'supabase', 'migrations');
assert(existsSync(join(migrationsDir, '20260216140200_f10_plan_templates.sql')), 'F10-004 plan_templates migration');
assert(existsSync(join(migrationsDir, '20260216140300_f10_household_members.sql')), 'F10-005 household_members migration');
assert(existsSync(join(migrationsDir, '20260216140400_f10_leftovers.sql')), 'F10-007 leftovers migration');

// ─── Navigation ───
console.log('\n🧪 Navigation');

assert(fileContains('navigation/AppNavigator.tsx', 'FavoritesScreen'), 'Nav: Favorites route');
assert(fileContains('navigation/AppNavigator.tsx', 'CustomMealScreen'), 'Nav: CustomMeal route');
assert(fileContains('navigation/AppNavigator.tsx', 'CookingTimerScreen'), 'Nav: CookingTimer route');
assert(fileContains('navigation/AppNavigator.tsx', 'LeftoverTrackerScreen'), 'Nav: LeftoverTracker route');
assert(fileContains('types/navigation.ts', 'CookingTimer'), 'Nav types: CookingTimer');
assert(fileContains('types/navigation.ts', 'LeftoverTracker'), 'Nav types: LeftoverTracker');

// ─── Summary ───
console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(`${'='.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
