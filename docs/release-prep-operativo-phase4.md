# F4-003 — Release prep operativo (PM/QA)

Fecha: 2026-02-16
Owner: PM/QA

## 1) Smoke beta playbook (operativo, 20–30 min)

### Objetivo
Confirmar que la build beta iOS está apta para prueba cerrada con flujo crítico funcional y observabilidad mínima activa.

### Precondiciones
- Build instalada desde TestFlight (versión candidata).
- `.env.local` válido para backend beta/prod controlado.
- Comando de guardrails disponible: `npm run check:observability`.
- Cuenta QA activa (o plan de fallback si Auth tiene rate limit).

### Ejecución paso a paso
1. **Sanidad de configuración local**
   - `cd mobile`
   - `npm run validate:env`
   - Esperado: OK sin variables faltantes.
2. **Backend smoke**
   - `npm run smoke:supabase`
   - Esperado: lectura/escritura mínima + auth básica sin error crítico.
3. **Arranque app y Auth**
   - Abrir app beta, login con usuario QA existente.
   - Validar recuperación ante error (copys + CTA) si falla login.
4. **Setup inicial**
   - Crear configuración: people/meals/level/max_time/region.
   - Verificar persistencia al reiniciar app.
5. **Plan semanal y swipes**
   - Aprobar al menos 2 comidas y reemplazar al menos 1.
   - Verificar evento local de analytics (`plan_created`, `meal_swapped`).
6. **Shopping list consolidada**
   - Abrir lista, validar categorías + edición manual de ingrediente.
   - Verificar no duplicados obvios tras reemplazo.
7. **Observabilidad**
   - `npm run check:observability`
   - Esperado: budgets/perf/error guardrails en estado verde.

### Evidencia mínima requerida
- Capturas: Auth OK, Plan con swipe/reemplazo, Shopping list.
- Logs de comandos `validate:env`, `smoke:supabase`, `check:observability`.
- Resultado final: PASS/FAIL con causa concreta.

---

## 2) Plantilla de reporte diario beta

## Daily Beta Report — Mealmap
- **Date (UTC):**
- **Build:**
- **Owner on duty:**
- **Status:** GREEN / YELLOW / RED

### A) Resumen ejecutivo (3 bullets)
- 
- 
- 

### B) KPIs operativos del día
- Smoke tests ejecutados:
- Smoke pass rate:
- Bugs nuevos (P0/P1/P2):
- Bugs cerrados:
- Crash count (beta):
- Errores auth/sync relevantes:

### C) Incidentes / bloqueos
1. **ID:**
   - Severidad:
   - Impacto:
   - Mitigación temporal:
   - Due date:

### D) Decisión de continuidad (hoy)
- Recomendación: Continue / Hold
- Riesgo principal:
- Acción concreta próxima:

### E) Adjuntos
- Links capturas/logs/tickets:

---

## 3) Criterios go/no-go beta

### GO (todos obligatorios)
1. Smoke core flow PASS en >=2 corridas consecutivas.
2. Sin bugs abiertos P0 y sin regresión crítica de Auth/Plan/List.
3. Observabilidad green (`check:observability` sin fallas críticas).
4. Config release iOS válida o placeholders explícitamente identificados con owner+fecha.
5. Runbook de rollback y canal de incidentes definido.

### CONDITIONAL GO (aceptable con control)
- Existe P2/P3 no bloqueante con workaround documentado.
- Riesgo comunicado en daily report + owner asignado.

### NO-GO (cualquiera de estos)
1. Cualquier P0 abierto.
2. Smoke FAIL repetido en flujo core (Auth, Plan, Shopping).
3. Error de configuración release que impida submit/build reproducible.
4. Falta de visibilidad operativa (sin logs mínimos / sin guardrails).

### Regla de decisión
- Si hay empate de criterio o duda operativa: **NO-GO por defecto** hasta cerrar evidencia faltante.
