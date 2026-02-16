# F4-001 — Runbook Operativo de Observabilidad (Beta)

Fecha: 2026-02-16

## Objetivo

Dar un flujo mínimo, repetible y verificable para detectar regresiones de performance y errores de app antes/durante beta cerrada.

## Señales clave

1. `perf_budget_exceeded`
   - origen: `measureAsync` en cliente
   - payload: `label`, `elapsedMs`, `budgetMs`
2. `app_error`
   - origen: `AppErrorBoundary` + logger de errores
   - payload: `source`, `message`

## Checklist diaria (beta)

- [ ] Ejecutar typecheck:
  - `npm --prefix mobile run typecheck`
- [ ] Ejecutar guardrails observabilidad:
  - `npm --prefix mobile run check:observability`
- [ ] Revisar pantalla Insights en app:
  - incremento inesperado en errores/perf alerts
- [ ] Si hay picos, abrir ticket F4 de mitigación con evidencia

## Umbrales sugeridos para acción

- `app_error` > 0 en sesión demo/happy-path
- `perf_budget_exceeded` repetido (>3) en auth o persistencia de plan

## Triage rápido

1. Identificar label/source más frecuente.
2. Reproducir flujo en dev.
3. Capturar evidencia (timestamp + pantalla + logs Expo).
4. Abrir ticket con:
   - impacto al usuario
   - severidad
   - propuesta de fix
   - rollback plan (si aplica)
