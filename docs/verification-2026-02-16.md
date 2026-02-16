# Verification log — 2026-02-16

## T-VRF-01 Verify setup defaults (lunch default)
- Checked `src/screens/setup/SetupScreen.tsx` initial state:
  - `includeBreakfast = false`
  - `includeLunch = true`
  - `includeDinner = false`
- Result: ✅ lunch default confirmed.

## T-VRF-02 Verify replace returns similar slot-compatible meal
- Checked `src/screens/plan/PlanScreen.tsx` in `replaceTopCard()`.
- Logic selects replacement with same `level` first:
  - `slotCompatible = dayPool.find(candidate => candidate.level === topCard.level && !usedIds.has(candidate.id))`
  - fallback to non-used candidate, then preferred cursor candidate.
- Result: ✅ slot-compatible (skill-level) replacement behavior confirmed.

## T-VRF-03 Verify shopping list totals (no duplicates)
- Checked `src/screens/shopping/ShoppingListScreen.tsx` in `consolidateIngredients()`.
- De-dup key: `category + name + unit` (case-insensitive).
- Repeated ingredients are summed via `prev.amount + ingredient.amount`.
- Result: ✅ consolidated totals without duplicate rows for same ingredient/unit/category.

## T-VRF-04 Verify user data isolation via RLS
- Checked `supabase/migrations/20260216082000_init_mvp_schema.sql`.
- RLS enabled for all user-data tables (`profiles`, `plans`, `plan_slots`, `meal_candidates`, `shopping_lists`, `shopping_items`).
- Policies consistently scoped to `auth.uid()` ownership through direct owner columns or joins.
- Result: ✅ RLS isolation policy coverage confirmed.

## T-TST-01 Unit tests: setup validation
- Added `src/domain/setupValidation.mjs` with validation rules for setup payload.
- Added test file `scripts/setup-validation.test.mjs`.
- Added npm script: `test:setup-validation`.
- Executed: `npm run test:setup-validation`.
- Result: ✅ 3/3 tests passing.
