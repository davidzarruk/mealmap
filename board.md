# Mealmap MVP Board (Option 3 - Kanban Live Priority)

_Last update: 2026-02-16 13:01 UTC_

## Backlog
- [x] B-001 Define month-horizon behavior (weekly batches vs full month) — decided: weekly batches (2026-02-16 04:26 UTC)
- [x] B-002 Add analytics events (plan_created, meal_swapped, list_generated) _(completed_at: 2026-02-16 09:37 UTC)_
- [x] B-003 Add onboarding tooltips for swipe gestures _(completed_at: 2026-02-16 09:37 UTC)_
- [x] B-004 Add manual ingredient edit in shopping list _(completed_at: 2026-02-16 09:45 UTC)_
- [x] B-005 Add favorite meals feature _(completed_at: 2026-02-16 09:45 UTC)_

## Next
- [x] F9-001 Nutritional info por meal _(DONE)_
- [x] F9-002 Weekly nutritional summary _(DONE)_
- [x] F9-003 Meal prep mode _(DONE)_
- [x] F9-004 Shopping list categories inteligentes _(DONE)_
- [x] F9-005 Pantry tracker _(DONE)_
- [x] F9-006 Meal calendar view _(DONE)_
- [x] F9-007 Social sharing _(DONE)_
- [x] F9-008 Push notifications server-side _(DONE)_
- [x] F9-009 App Store metadata prep _(DONE)_
- [x] F9-010 Final integration test suite _(DONE)_

- [x] F10-002 Custom meal creation _(DONE)_
- [x] F10-003 Grocery store integration prep _(DONE)_
- [x] F10-004 Meal plan templates _(DONE)_
- [x] F10-005 Family/household sharing _(DONE)_
- [x] F10-006 Cooking timer integrado _(DONE)_
- [x] F10-007 Leftover tracker _(DONE)_
- [x] F10-008 Seasonal ingredients _(DONE)_
- [x] F10-009 Crash reporting prep _(DONE)_
- [x] F10-010 Full regression test suite _(DONE)_

- [x] F6-001 Dark mode adoption completa _(rol: Developer/UX — DONE)_
- [x] F6-002 Onboarding flow _(rol: Developer/UX — DONE)_
- [x] F6-003 Profile/Settings screen _(rol: Developer — DONE)_
- [x] F6-004 Meal detail screen dedicada _(rol: Developer/UX — DONE)_
- [x] F6-005 Notificaciones locales _(rol: Developer — DONE)_
- [x] F6-006 Export shopping list — compartir lista por WhatsApp/clipboard como texto formateado _(rol: Developer — DONE)_
- [x] F6-007 Animaciones de transición entre screens con layout animations _(rol: Developer/UX — DONE)_
- [x] F6-008 Search/filter en la lista de meals aprobadas y favoritas _(rol: Developer/UX — DONE)_
- [x] F6-009 Weekly summary card — resumen visual del plan de la semana _(rol: Developer/UX — DONE)_
- [x] F6-010 Unit + integration test coverage boost — cubrir nuevos componentes F5/F6 _(rol: Tester — DONE)_

## In Progress
- (empty)

## In Review
- (empty)

## QA
- (empty)

## Done
- [x] F10-010 Full regression test suite — 72 tests F6-F10, 100% pass _(completed_at: 2026-02-16 14:58 UTC; artefactos: `scripts/f10-regression.test.mjs`)_
- [x] F10-009 Crash reporting prep — Sentry-compatible stub, NO real SDK, captureException/Message/Breadcrumbs _(completed_at: 2026-02-16 14:57 UTC; artefactos: `src/lib/crashReporting.ts`)_
- [x] F10-008 Seasonal ingredients — JSON con 50+ ingredientes colombianos por mes, getSeasonalIngredients, isInSeason _(completed_at: 2026-02-16 14:56 UTC; artefactos: `src/data/seasonalIngredients.ts`)_
- [x] F10-007 Leftover tracker — CRUD + LeftoverTrackerScreen + suggestMealsForLeftovers + migración RLS _(completed_at: 2026-02-16 14:55 UTC; artefactos: `src/lib/leftoverService.ts`, `src/screens/leftovers/LeftoverTrackerScreen.tsx`, `supabase/migrations/20260216140400_f10_leftovers.sql`)_
- [x] F10-006 Cooking timer integrado — countdown visual, pause/resume, haptic on done _(completed_at: 2026-02-16 14:54 UTC; artefactos: `src/screens/cooking/CookingTimerScreen.tsx`)_
- [x] F10-005 Family/household sharing — invite by email, accept/decline, roles (viewer/editor/admin) + migración RLS _(completed_at: 2026-02-16 14:53 UTC; artefactos: `src/lib/householdService.ts`, `supabase/migrations/20260216140300_f10_household_members.sql`)_
- [x] F10-004 Meal plan templates — save/load/apply templates via Supabase + migración RLS _(completed_at: 2026-02-16 14:52 UTC; artefactos: `src/lib/planTemplateService.ts`, `supabase/migrations/20260216140200_f10_plan_templates.sql`)_
- [x] F10-003 Grocery store integration prep — abstract service layer Rappi/Merqueo, mock impl, search/cart/pricing _(completed_at: 2026-02-16 14:51 UTC; artefactos: `src/lib/groceryStoreService.ts`)_
- [x] F10-002 Custom meal creation — full form: name, dynamic ingredients, steps, time, servings, category/difficulty _(completed_at: 2026-02-16 14:50 UTC; artefactos: `src/screens/meals/CustomMealScreen.tsx`)_
- [x] F10-001 Meal favorites collection — dedicated screen, search, category filter, unfavorite, nutrition display _(completed_at: 2026-02-16 14:49 UTC; artefactos: `src/screens/favorites/FavoritesScreen.tsx`)_
- [x] F9-010 Final integration test suite — test completo del flujo con todas las features F6-F9 _(completed_at: 2026-02-16 13:35 UTC; artefactos: `scripts/f9-integration.test.mjs`)_
- [x] F9-009 App Store metadata prep — screenshots, descripción, keywords, privacy policy _(completed_at: 2026-02-16 13:34 UTC; artefactos: `docs/app-store-metadata.md`)_
- [x] F9-008 Push notifications server-side — recordatorios desde Supabase Edge Functions _(completed_at: 2026-02-16 13:34 UTC; artefactos: `supabase/functions/push-notifications/index.ts`)_
- [x] F9-007 Social sharing — compartir meal como imagen formateada por WhatsApp/Instagram _(completed_at: 2026-02-16 13:33 UTC; artefactos: `src/components/ShareableMealCard.tsx`)_
- [x] F9-006 Meal calendar view — vista mensual tipo calendario _(completed_at: 2026-02-16 13:32 UTC; artefactos: `src/screens/plan/MealCalendarScreen.tsx`, `src/navigation/AppNavigator.tsx`)_
- [x] F9-005 Pantry tracker — marcar ingredientes que ya se tienen, descontar de shopping list _(completed_at: 2026-02-16 13:31 UTC; artefactos: `src/lib/pantryService.ts`, `supabase/migrations/20260216133000_f9_pantry_tracker.sql`)_
- [x] F9-004 Shopping list categories inteligentes — agrupar por sección del supermercado _(completed_at: 2026-02-16 13:31 UTC; artefactos: `src/lib/shoppingCategories.ts`)_
- [x] F9-003 Meal prep mode — agrupar meals por ingredientes compartidos, sugerir orden batch _(completed_at: 2026-02-16 13:30 UTC; artefactos: `src/lib/mealPrepMode.ts`, `src/screens/plan/MealPrepScreen.tsx`)_
- [x] F9-002 Weekly nutritional summary — gráfico semanal de macros con totales por día _(completed_at: 2026-02-16 13:28 UTC; artefactos: `src/components/WeeklyNutritionChart.tsx`, `src/screens/plan/PlanScreen.tsx`)_
- [x] F9-001 Nutritional info por meal — calorías, proteína, carbs, grasa por porción en MealDetail _(completed_at: 2026-02-16 13:25 UTC; artefactos: `src/lib/nutritionEstimation.ts`, `src/screens/plan/MealDetailsScreen.tsx`)_
- [x] F8-010 Performance profiling + optimization — hooks para re-render tracking, deferred rendering, debounced values, pagination, perf measurement _(completed_at: 2026-02-16 13:28 UTC; artefactos: `src/lib/performanceOptimization.ts`)_
- [x] F8-009 Accessibility audit completo — WCAG contrast checker, font scaling, reduced motion hook, screen reader detection, VoiceOver label builders, theme audit tool _(completed_at: 2026-02-16 13:27 UTC; artefactos: `src/lib/accessibility.ts`)_
- [x] F8-008 Budget estimation — estimación COP/USD con base de precios colombiana, formateo regional, confidence levels _(completed_at: 2026-02-16 13:26 UTC; artefactos: `src/lib/budgetEstimation.ts`)_
- [x] F8-007 Widget iOS — spec documentado + bridge stub para Expo managed, Swift widget template completo _(completed_at: 2026-02-16 13:25 UTC; artefactos: `docs/ios-widget-spec.md`, `src/lib/widgetBridge.ts`)_
- [x] F8-006 Swipe tutorial interactivo — overlay animado con demo de mano deslizando, auto-dismiss, persistencia _(completed_at: 2026-02-16 13:24 UTC; artefactos: `src/components/SwipeTutorial.tsx`)_
- [x] F8-005 Offline mode robusto — cache AsyncStorage de plan+shopping, cola de mutaciones pendientes, sync al reconectar con NetInfo _(completed_at: 2026-02-16 13:23 UTC; artefactos: `src/lib/offlineSync.ts`, dep: `@react-native-community/netinfo`)_
- [x] F8-004 Deep linking — config React Navigation con mealmap:// y https://mealmap.app, share helpers, deep link parser _(completed_at: 2026-02-16 13:22 UTC; artefactos: `src/lib/deepLinking.ts`)_
- [x] F8-003 Internationalization (i18n) — sistema de traducción EN/ES completo, detección de idioma del dispositivo, hook reactivo useTranslation _(completed_at: 2026-02-16 13:21 UTC; artefactos: `src/lib/i18n.ts`)_
- [x] F8-002 Imagen de meals con AI — URLs Unsplash sin API key, placeholders SVG data URI por categoría, emoji+color mapping _(completed_at: 2026-02-16 13:20 UTC; artefactos: `src/lib/mealImageService.ts`)_
- [x] F8-001 LLM meal generation real — servicio abstracto con MockProvider (default) + OpenAI/Claude providers, prompts, JSON parsers, singleton configurable _(completed_at: 2026-02-16 13:19 UTC; artefactos: `src/lib/mealGenerationService.ts`)_
- [x] F7-010 E2E smoke test suite — 10-step automated test: signup → signin → create plan → approve → shopping list → toggle checked → rate meal → complete → history → cleanup _(completed_at: 2026-02-16 13:15 UTC; artefactos: `scripts/f7-e2e-smoke.test.mjs`, `package.json`)_
- [x] F7-009 Image placeholders con categoría — emoji icons por tipo de meal (chicken, beef, fish, pasta, rice, soup, salad, egg, vegetable, wrap) con colores de fondo _(completed_at: 2026-02-16 13:14 UTC; artefactos: `components/MealCategoryIcon.tsx`, `screens/plan/PlanScreen.tsx`)_
- [x] F7-008 Ingredient substitution suggestions — mapa de sustituciones (milk→almond/oat, beef→lentils, pasta→zucchini, etc.) con UI inline en shopping list _(completed_at: 2026-02-16 13:13 UTC; artefactos: `lib/ingredientSubstitutions.ts`, `screens/shopping/ShoppingListScreen.tsx`)_
- [x] F7-007 Portion scaling — selector de escala (0.5×–3×) que recalcula ingredientes automáticamente en PlanScreen y pasa a MealDetails _(completed_at: 2026-02-16 13:12 UTC; artefactos: `screens/plan/PlanScreen.tsx`)_
- [x] F7-006 Dietary tags/filters — filtro por vegetarian/gluten-free/high-protein/low-carb/dairy-free/vegan + tabla `user_dietary_filters` + `dietary_tags` en meal_candidates _(completed_at: 2026-02-16 13:11 UTC; artefactos: `lib/supabasePlanService.ts`, `screens/plan/PlanScreen.tsx`, migration SQL)_
- [x] F7-005 Meal rating system — thumbs up/down con tabla `meal_ratings` + RLS + UI inline en meal cards _(completed_at: 2026-02-16 13:10 UTC; artefactos: `lib/supabasePlanService.ts`, `screens/plan/PlanScreen.tsx`, migration SQL)_
- [x] F7-004 Multi-week history — PlanHistoryScreen con listado de planes completados, tap-to-expand con meals por día _(completed_at: 2026-02-16 13:09 UTC; artefactos: `screens/plan/PlanHistoryScreen.tsx`, `navigation/AppNavigator.tsx`, `types/navigation.ts`)_
- [x] F7-003 Shopping list persistence en Supabase — checkboxes de items comprados + sync bidireccional + `checked` column en shopping_items _(completed_at: 2026-02-16 13:09 UTC; artefactos: `screens/shopping/ShoppingListScreen.tsx`, `lib/supabasePlanService.ts`, migration SQL)_
- [x] F7-002 Supabase-backed weekly plans — createOrGetCurrentPlan + loadWeekPlanFromSupabase + completePlan + getPlanHistory _(completed_at: 2026-02-16 13:08 UTC; artefactos: `lib/supabasePlanService.ts`, `screens/plan/PlanScreen.tsx`)_
- [x] F7-001 Supabase-backed meal persistence — saveMealsToSupabase con upsert slots + candidates, fallback local con AsyncStorage _(completed_at: 2026-02-16 13:07 UTC; artefactos: `lib/supabasePlanService.ts`, `screens/plan/PlanScreen.tsx`, migration SQL)_
- [x] F6-010 Unit + integration test coverage boost — 14 tests: theme validation, consolidation edge cases, approve/replace, weekly summary _(completed_at: 2026-02-16 13:10 UTC; artefactos: `scripts/f6-coverage.test.mjs`, `package.json`)_
- [x] F6-009 Weekly summary card — resumen visual con stats por día y % completado _(completed_at: 2026-02-16 13:08 UTC; artefactos: `components/WeeklySummaryCard.tsx`, `screens/plan/PlanScreen.tsx`)_
- [x] F6-008 Search/filter en meals — búsqueda por título + filtro favoritos en PlanScreen _(completed_at: 2026-02-16 13:06 UTC; artefactos: `screens/plan/PlanScreen.tsx`)_
- [x] F6-007 Animaciones de transición — slide/fade en stack + LayoutAnimation en day tabs _(completed_at: 2026-02-16 13:04 UTC; artefactos: `navigation/AppNavigator.tsx`, `navigation/MainTabsNavigator.tsx`, `screens/plan/PlanScreen.tsx`)_
- [x] F6-006 Export shopping list — compartir lista por WhatsApp/clipboard como texto formateado _(completed_at: 2026-02-16 13:02 UTC; artefactos: `screens/shopping/ShoppingListScreen.tsx`, dep: `expo-clipboard`)_
- [x] F6-005 Notificaciones locales — recordatorio diario configurable con expo-notifications _(completed_at: 2026-02-16 13:01 UTC; artefactos: `lib/notifications.ts`, `screens/profile/ProfileScreen.tsx`, dep: `expo-notifications`)_
- [x] F6-004 Meal detail screen dedicada — foto placeholder, ingredientes, pasos, tiempo, porciones _(completed_at: 2026-02-16 12:58 UTC; artefacto: `screens/plan/MealDetailsScreen.tsx`)_
- [x] F6-003 Profile/Settings screen — nombre, preferencias de comida, logout, app version _(completed_at: 2026-02-16 12:56 UTC; artefactos: `screens/profile/ProfileScreen.tsx`, dep: `expo-constants`)_
- [x] F6-002 Onboarding flow — 3 slides explicativos antes del signup _(completed_at: 2026-02-16 12:53 UTC; artefactos: `screens/onboarding/OnboardingScreen.tsx`, `navigation/RootNavigator.tsx`)_
- [x] F6-001 Dark mode adoption completa — useThemeColors() en todas las screens/componentes _(completed_at: 2026-02-16 12:50 UTC; artefactos: PlanScreen, ShoppingListScreen, SetupScreen, SignUpScreen, MealDetailsScreen, ProfileScreen, AnalyticsScreen, Skeleton)_
- [x] K-006 QA E2E Kanban — validación directa vía Supabase (sin UI), flujo sync+realtime verificado _(completed_at: 2026-02-16 12:45 UTC)_
- [x] F5-010 Network connectivity banner — detectar offline y mostrar aviso persistente _(rol: Developer/UX, completed_at: 2026-02-16 13:01 UTC; artefactos: `components/OfflineBanner.tsx`, `App.tsx`)_
- [x] F5-009 Adoptar useThemeColors() en ScreenContainer + auth screens para dark mode real _(rol: Developer/UX, completed_at: 2026-02-16 12:59 UTC; artefactos: `ScreenContainer.tsx`, `SignInScreen.tsx`)_
- [x] F5-008 Dark mode soporte con useColorScheme + theme dinámico _(rol: Developer/UX, completed_at: 2026-02-16 12:56 UTC; artefacto: `theme/colors.ts` — added `useThemeColors()` hook + `darkColors` palette)_
- [x] F5-007 Keyboard dismiss + auto-focus mejoras en auth y setup screens _(rol: Developer/UX, completed_at: 2026-02-16 12:54 UTC; artefactos: `SignInScreen.tsx`, `SignUpScreen.tsx`, `SetupScreen.tsx`)_
- [x] F5-006 Confetti/celebration micro-animation al completar 100% del plan semanal _(rol: Developer/UX, completed_at: 2026-02-16 12:51 UTC; artefacto: `PlanScreen.tsx`)_
- [x] F5-005 Swipe visual cues — color overlay + iconos (✓/↻) al arrastrar tarjeta _(rol: Developer/UX, completed_at: 2026-02-16 12:48 UTC; artefacto: `PlanScreen.tsx`)_
- [x] F5-004 Skeleton placeholders durante carga inicial en PlanScreen y ShoppingListScreen _(rol: Developer/UX, completed_at: 2026-02-16 12:45 UTC; artefactos: `components/Skeleton.tsx`, `PlanScreen.tsx`, `ShoppingListScreen.tsx`)_
- [x] F5-003 Haptic feedback en swipe approve/replace + favorite toggle _(rol: Developer/UX, completed_at: 2026-02-16 12:43 UTC; artefactos: `PlanScreen.tsx`, dep added: `expo-haptics`)_
- [x] F5-002 Accessibility pass — accessibilityLabel + accessibilityRole en componentes interactivos clave _(rol: Developer/UX, completed_at: 2026-02-16 12:41 UTC; artefactos: `PlanScreen.tsx`, `SignInScreen.tsx`, `ShoppingListScreen.tsx`)_
- [x] F5-001 Loading states + pull-to-refresh en PlanScreen y ShoppingListScreen _(rol: Developer/UX, completed_at: 2026-02-16 12:38 UTC; artefactos: `ScreenContainer.tsx` refreshControl prop, `PlanScreen.tsx` loading+refresh, `ShoppingListScreen.tsx` loading+refresh)_
- [x] F4-006 Mitigación operativa de bloqueo K-006 (QA auth rate-limit + verificación `ticket_events` endpoint) _(rol: Backend/QA, completed_at: 2026-02-16 12:35 UTC; artefactos: `scripts/preflight-kanban-supabase.mjs`, `docs/f4-006-mitigacion-bloqueo-k006.md`; root-cause: kanban migration never applied to Supabase project)_
- [x] F4-005 Beta launch packet v1 _(rol: PM/QA, completed_at: 2026-02-16 12:16:02 UTC; artefacto: `docs/beta-launch-packet-v1-phase4.md`)_
- [x] F4-004 Preflight de release iOS (placeholders/IDs faltantes aislados + checklist accionable final) _(rol: DevOps/Release, completed_at: 2026-02-16 12:16:01 UTC; artefacto: `docs/ios-release-preflight-phase4.md`; bloqueo externo documentado: faltan IDs reales `IOS_EAS_PROJECT_ID`, `IOS_ASC_APP_ID`, `IOS_APPLE_TEAM_ID`)_
- [x] F4-003 Release prep operativo (smoke beta playbook + daily report template + criterios go/no-go) _(rol: PM/QA, completed_at: 2026-02-16 12:16:00 UTC; artefacto: `docs/release-prep-operativo-phase4.md`)_
- [x] F4-002 UX polish de estados vacíos/errores (copys accionables + CTA de recuperación en Auth + logging de fallos inesperados) _(rol: UX, completed_at: 2026-02-16 10:25:10 UTC; artefactos: `mobile/src/screens/auth/SignInScreen.tsx`, `mobile/src/screens/auth/SignUpScreen.tsx`, `docs/ux-polish-errors-empty-states-phase4.md`)_
- [x] F4-001 Observabilidad operativa beta (runbook de triage + checklist de budgets/errores + comando de guardrails local) _(rol: PM/QA, completed_at: 2026-02-16 10:24:13 UTC; artefactos: `mobile/scripts/check-observability-guardrails.mjs`, `mobile/package.json`, `docs/operational-observability-runbook-beta.md`)_
- [x] F3-005 Error handling hardening cliente (error boundary global + logging de errores en analytics local) _(rol: Developer, completed_at: 2026-02-16 10:23:25 UTC; artefactos: `mobile/src/components/AppErrorBoundary.tsx`, `mobile/src/lib/errors.ts`, `mobile/App.tsx`, `docs/error-handling-hardening-phase3.md`)_
- [x] F3-004 Performance/analytics guardrails en cliente (instrumentación de tiempos críticos + budget checks) _(rol: Developer, completed_at: 2026-02-16 10:22:33 UTC; artefactos: `mobile/src/lib/perf.ts`, `mobile/src/lib/analytics.ts`, `docs/performance-guardrails-phase3.md`)_
- [x] F3-003 Beta hardening pack (checklist deploy+beta accionable para handoff operativo) _(rol: PM/QA, completed_at: 2026-02-16 10:10:34 UTC; artefacto: `docs/handoff-deploy-beta-phase3.md`)_
- [x] F3-002 Robustecer validaciones Supabase prod (baseline+deep checks RLS, cleanup de users, docs de operación) _(rol: Backend, completed_at: 2026-02-16 10:09:50 UTC; nota: en env actual `ticket_events` responde 404 y deep-check requiere `SUPABASE_SERVICE_ROLE_KEY`)_
- [x] F3-001 Cierre operativo iOS release placeholders (script apply IDs reales + runbook de handoff actualizado) _(rol: DevOps, completed_at: 2026-02-16 10:09:50 UTC; bloqueo externo: faltan IDs reales de Apple/EAS)_
- [x] F2-001 Release readiness iOS (EAS/TestFlight checklist + configuración base) _(rol: DevOps, completed_at: 2026-02-16 10:00:41 UTC; bloqueo: placeholders de Apple/EAS aún pendientes)_
- [x] F2-002 Backend productivo Supabase (checklist/procedimiento prod + validaciones baseline) _(rol: Backend, completed_at: 2026-02-16 10:01:37 UTC; bloqueo: faltan envs/owner access para validaciones administrativas profundas)_
- [x] F2-003 Contenido inicial/seed meals + reglas de reemplazo refinadas _(rol: LLM Curator, completed_at: 2026-02-16 10:02:29 UTC)_
- [x] F2-004 Medición/analytics dashboard básico _(rol: Developer, completed_at: 2026-02-16 10:03:19 UTC)_
- [x] F2-005 Plan de salida beta cerrada + runbook de bugs _(rol: PM/QA, completed_at: 2026-02-16 10:03:58 UTC)_
- [x] D-001 Product direction confirmed with user _(completed_at: 2026-02-16, hora exacta no registrada)_
- [x] D-002 Team roles confirmed (Planner, Developer, Verifier, Tester, Reviewer + UX, LLM Curator, DevOps) _(completed_at: 2026-02-16, hora exacta no registrada)_
- [x] D-003 Core decisions confirmed _(completed_at: 2026-02-16, hora exacta no registrada)_:
  - iOS-first mobile
  - Region Colombia
  - Lunch default, optional breakfast/dinner
  - 7-day week
  - No healthy/outlive constraints in MVP
- [x] D-004 PRD v1 drafted (mealmap/PRD.md) _(completed_at: 2026-02-16 04:19 UTC, primer reporte de done)_
- [x] D-005 MVP task decomposition created (board + sprint tickets) _(completed_at: 2026-02-16 04:19 UTC, primer reporte de done)_
- [x] D-006 Expo TypeScript app scaffold created (mealmap/mobile) _(completed_at: 2026-02-16 04:19 UTC, primer reporte de done)_
- [x] P-003 Add navigation + app folder structure (mobile) _(completed_at: 2026-02-16 08:24 UTC)_
- [x] P-004 Draft Supabase SQL schema/migrations _(completed_at: 2026-02-16 08:24 UTC)_
- [x] N-002 Create DB schema + RLS policies _(completed_at: 2026-02-16 08:24 UTC)_
- [x] N-001 Create Supabase project and env vars _(completed_at: 2026-02-16 09:45 UTC)_
- [x] N-002 Final smoke validation of migration in Supabase project _(completed_at: 2026-02-16 09:45 UTC, smoke:supabase real verificado con env local)_
- [x] N-004 Implement Auth screens (Sign up / Sign in) _(completed_at: 2026-02-16 08:32 UTC)_
- [x] N-005 Define setup form (people, meals, level, max time, region) _(completed_at: 2026-02-16 08:32 UTC)_
- [x] N-001-L Local env wiring/docs/checklist for Supabase vars + smoke command path _(completed_at: 2026-02-16 08:48 UTC)_
- [x] R-001 Validate MVP scope against user constraints _(completed_at: 2026-02-16 09:10 UTC)_
- [x] Q-001 Test cases draft (auth, swipe, replace, consolidation) _(completed_at: 2026-02-16 09:11 UTC)_
- [x] K-001 Diseñar esquema Supabase Kanban (tickets + ticket_events + índices + RLS owner/auth) _(completed_at: 2026-02-16 09:20 UTC)_
- [x] K-002 Implementar migración SQL Kanban Live V1 + publicación realtime _(completed_at: 2026-02-16 09:20 UTC)_
- [x] K-003 Crear script idempotente de sync inicial desde board.md a Supabase _(completed_at: 2026-02-16 09:20 UTC)_
- [x] K-004 Construir web app kanban-live con Supabase realtime + cambio de estado persistente + log de eventos _(completed_at: 2026-02-16 09:20 UTC)_
- [x] K-005 Documentar ejecución local y operación del flujo Kanban Live V1 _(completed_at: 2026-02-16 09:20 UTC)_

---

## Sprint 1 Tickets (Detailed)

### Planner
- [x] T-PL-01 Finalize PRD v1.1 (month behavior clarified) _(completed_at: 2026-02-16 09:07 UTC)_
- [x] T-PL-02 Write acceptance criteria for all core flows _(completed_at: 2026-02-16 09:10 UTC)_
- [x] T-PL-03 Define error states and fallback UX _(completed_at: 2026-02-16 09:10 UTC)_

### Developer
- [x] T-DEV-01 Initialize Expo app (TS, lint, env) _(completed_at: 2026-02-16 09:11 UTC)_
- [x] T-DEV-02 Configure Supabase client (mobile) _(completed_at: 2026-02-16 08:32 UTC)_
- [x] T-DEV-03 Build auth flow (register/login/logout) _(completed_at: 2026-02-16 08:32 UTC)_
- [x] T-DEV-04 Build Setup screen (all input fields) _(completed_at: 2026-02-16 08:32 UTC)_
- [x] T-DEV-05 Build Plan screen (day tabs + card deck) _(completed_at: 2026-02-16 08:35 UTC)_
- [x] T-DEV-06 Implement swipe right approve _(completed_at: 2026-02-16 08:36 UTC)_
- [x] T-DEV-07 Implement swipe left replace _(completed_at: 2026-02-16 08:50 UTC)_
- [x] T-DEV-08 Card details modal (ingredients + short prep) _(completed_at: 2026-02-16 08:52 UTC)_
- [x] T-DEV-09 Build shopping list screen by categories _(completed_at: 2026-02-16 08:52 UTC)_
- [x] T-DEV-10 Persist/reload latest plan _(completed_at: 2026-02-16 08:53 UTC)_

### Verifier
- [x] T-VRF-01 Verify setup defaults (lunch default) _(completed_at: 2026-02-16 08:56 UTC)_
- [x] T-VRF-02 Verify replace returns similar slot-compatible meal _(completed_at: 2026-02-16 08:56 UTC)_
- [x] T-VRF-03 Verify shopping list totals (no duplicates) _(completed_at: 2026-02-16 08:56 UTC)_
- [x] T-VRF-04 Verify user data isolation via RLS _(completed_at: 2026-02-16 08:56 UTC)_

### Tester
- [x] T-TST-01 Unit tests: setup validation _(completed_at: 2026-02-16 08:56 UTC)_
- [x] T-TST-02 Integration tests: create plan + approve all _(completed_at: 2026-02-16 09:00 UTC)_
- [x] T-TST-03 Integration tests: replace flow _(completed_at: 2026-02-16 09:00 UTC)_
- [x] T-TST-04 Integration tests: consolidated list totals _(completed_at: 2026-02-16 09:00 UTC)_
- [x] T-TST-05 Smoke test on iPhone simulator _(completed_at: 2026-02-16 09:00 UTC; ejecutado smoke automatizado, launch de simulador iOS omitido por host Linux/non-macOS)_

### Reviewer
- [x] T-RVW-01 Code quality pass (naming, structure, DX) _(completed_at: 2026-02-16 09:00 UTC)_
- [x] T-RVW-02 Security pass (auth/session handling) _(completed_at: 2026-02-16 09:05 UTC)_
- [x] T-RVW-03 Performance pass (slow actions >2.5s) _(completed_at: 2026-02-16 09:05 UTC)_

### UX / Content
- [x] T-UX-01 English copy for all MVP screens _(completed_at: 2026-02-16 09:05 UTC)_
- [x] T-UX-02 Card visual hierarchy and progress indicator _(completed_at: 2026-02-16 09:05 UTC)_
- [x] T-UX-03 Empty/error states messaging _(completed_at: 2026-02-16 09:05 UTC)_

### LLM / Recipe Curator
- [x] T-LLM-01 Define meal generation contract (input/output JSON) _(completed_at: 2026-02-16 09:05 UTC)_
- [x] T-LLM-02 Define similarity constraints for replacements _(completed_at: 2026-02-16 09:06 UTC)_
- [x] T-LLM-03 Ingredient normalization rules for consolidation _(completed_at: 2026-02-16 09:06 UTC)_

### DevOps
- [x] T-OPS-01 Environments (dev/staging) _(completed_at: 2026-02-16 09:07 UTC)_
- [x] T-OPS-02 Secret management _(completed_at: 2026-02-16 09:07 UTC)_
- [x] T-OPS-03 Logging + basic health checks _(completed_at: 2026-02-16 09:07 UTC)_

---

## ETA (initial)
- Foundation (auth + schema + app skeleton): 1–2 days
- Core planning + swipe + replace: 2–3 days
- Shopping list + persistence: 1–2 days
- QA + polish + TestFlight prep: 1–2 days

Estimated MVP total: **5–9 working days**.

---

## Reporting cadence
- Status update every 60–90 min while active
- Format:
  1) What moved to Done
  2) What is In Progress
  3) Blockers / Decisions needed
