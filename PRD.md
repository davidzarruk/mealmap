# Mealmap MVP PRD (v1.1)

## 1) Product Summary
Mealmap is a mobile-first app that helps users create a 7-day meal plan using swipeable cards (Tinder-like). Users can accept or reject meal suggestions; rejected meals are replaced with similar alternatives. Once all meals are approved, the app generates a consolidated shopping list with total ingredient quantities.

## 2) Target User
People in Colombia planning day-to-day meals from their phone.

## 3) MVP Goals
- Fast weekly meal planning (default: lunch only).
- Minimal friction card review (swipe right accept, left replace).
- Consolidated shopping list for the full week.
- User account/login.

## 4) Scope (MVP)
### Included
1. Auth (email + password)
2. Plan setup:
   - Horizon input: day/week/month
   - **Month behavior (confirmed):** month plans are generated and managed as weekly batches (4-5 weekly sets), not as one single 30-day generation.
   - Number of people (1–6)
   - Meals: lunch default; optional breakfast/dinner
   - Cooking level (easy/intermediate/advanced)
   - Max cooking time (15/30/45/60 min)
   - Region: Colombia (default)
3. Card-based meal suggestions by day/meal slot
4. Swipe interactions:
   - Right = approve
   - Left = replace with similar option
5. Meal detail on tap
6. Consolidated shopping list (ingredient-by-ingredient totals)
7. Save/reopen latest approved plan

### Excluded (Phase 2)
- WhatsApp supplier ordering
- Supermarket cart integrations
- Nutrition scoring / “healthy mode” / Outlive logic
- Advanced personalization from historical behavior

## 5) UX Requirements
- Mobile first (iPhone priority)
- English UI text for MVP
- Card deck for each day/meal slot
- Clear progress indicator (e.g., 9/21 meals approved)
- One-tap view for shopping list categories + totals

## 6) Functional Requirements
FR-01 User can register/login.
FR-02 User can create a weekly plan with selected parameters.
FR-03 System generates meal candidates for each slot.
FR-04 User can approve a card via swipe right.
FR-05 User can reject a card via swipe left and receive a similar replacement.
FR-06 User can open card details (ingredients + short prep).
FR-07 System tracks approved state for all slots.
FR-08 Once complete, system creates consolidated shopping list totals.
FR-09 User can view shopping list by category.
FR-10 User can revisit last plan and list.

## 7) Non-Functional Requirements
- p95 API response under 2.5s for standard actions
- Basic validation + error handling
- Secure auth and user data isolation
- Logging for generation/swap/shopping list events

## 8) Recommended Tech Stack
- Mobile: React Native + Expo (iOS first)
- Backend/Data/Auth: Supabase (Postgres + Auth + RLS + Edge Functions)
- Optional orchestration endpoint: Supabase Edge Functions

## 9) Data Model (MVP)
- users (Supabase auth)
- plans (id, user_id, horizon, people_count, meal_types, cooking_level, max_time, region, status)
- plan_slots (id, plan_id, day_index, meal_type, approved_meal_id)
- meal_candidates (id, slot_id, title, ingredients_json, prep_steps_short, est_time, tags)
- shopping_lists (id, plan_id)
- shopping_items (id, shopping_list_id, ingredient_name, unit, total_qty, category)

## 10) Success Metrics (MVP)
- Time to first complete plan < 10 min
- Swap success rate > 95%
- % of users who generate shopping list after plan > 70%

## 11) Decisions Status
- Month horizon behavior: **resolved** -> weekly batches.
- Source of meal generation: pending (seeded catalog + LLM fallback vs generated-first).

## 12) Milestones
M1: Foundation (auth, schema, skeleton app)
M2: Planning flow + cards + swipe
M3: Replacement logic + details
M4: Shopping list consolidation
M5: QA + polish + TestFlight build
