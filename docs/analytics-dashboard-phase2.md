# Fase 2 · Medición / dashboard básico

## Implementación

Se creó una vista básica de métricas en mobile:

- `mobile/src/screens/analytics/AnalyticsScreen.tsx`
- Tab nueva `Insights` en `MainTabsNavigator`
- Helpers en `mobile/src/lib/analytics.ts`:
  - `getAnalyticsEvents(limit)`
  - `getAnalyticsSummary()`

## Métricas visibles

- `plan_created`
- `meal_swapped`
- `list_generated`

Además muestra lista de los últimos 10 eventos con timestamp local.

## Alcance

- Dashboard local (AsyncStorage) para validar instrumentación y adopción inicial
- No reemplaza BI productivo, pero habilita baseline de uso para beta cerrada
