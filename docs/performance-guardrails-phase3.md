# F3-004 — Performance/Analytics Guardrails (Client)

Fecha: 2026-02-16

## Implementado

- Presupuestos (budget checks) por acción crítica en `mobile/src/lib/perf.ts`:
  - `auth.signInWithPassword`: 1800ms
  - `auth.signUp`: 2200ms
  - `plan.loadWeekPlan`: 800ms
  - `plan.saveWeekPlan`: 1000ms
  - default fallback: 2500ms
- `measureAsync` ahora:
  - detecta `budget exceeded`
  - emite warning estructurado en consola
  - registra evento analytics local `perf_budget_exceeded` con `label`, `elapsedMs`, `budgetMs`
- Se amplió taxonomía de eventos en `mobile/src/lib/analytics.ts` para soportar:
  - `perf_budget_exceeded`
  - `app_error` (reservado para hardening siguiente)

## Impacto beta

- Visibilidad inmediata de regresiones de latencia en acciones sensibles del MVP.
- Señal de observabilidad local sin bloquear UX ni depender de backend de analytics.
- Base para tuning de performance por flujo real de usuarios beta.
