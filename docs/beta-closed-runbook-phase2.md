# Fase 2 · Plan de salida beta cerrada + runbook de bugs

## Objetivo de beta cerrada (2 semanas)

- 20–30 testers iOS (TestFlight)
- medir activación y uso semanal
- recoger bugs críticos de flujo principal

## Cohortes sugeridas

- 10 usuarios cocinan 3+ veces/semana
- 10 usuarios cocinan ocasionalmente
- 5 usuarios novatos en meal planning

## KPIs mínimos

- Activación D1: signup + setup completo
- Semana 1: al menos 1 plan generado
- Swaps por plan (sensibilidad de reemplazo)
- generación de lista de compras por semana

## Severidad de bugs

- **S0**: crash/login roto/pérdida de datos
- **S1**: flujo principal bloqueado (setup, approve, replace, shopping)
- **S2**: errores con workaround
- **S3**: issues visuales/copy

## Runbook operativo de bugs

1. Recibir bug (TestFlight feedback / canal interno)
2. Crear ticket con plantilla:
   - build/version
   - dispositivo + iOS
   - pasos de reproducción
   - esperado vs actual
   - evidencia (screenshot/video)
3. Triage en <24h con severidad S0..S3
4. Asignación y ETA
5. Fix + QA de regresión en build candidata
6. Cierre con nota de release

## Criterios Go/No-Go para ampliar beta

**Go**
- 0 bugs S0 abiertos
- <=2 bugs S1 abiertos con workaround
- éxito en smoke de flujos core

**No-Go**
- cualquier bug S0 abierto
- fallos repetidos de auth/sync
- build inestable en >15% testers
