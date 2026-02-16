# Fase 2 · Reglas de reemplazo refinadas

## Cambios aplicados

Se actualizó `mobile/src/domain/planFlow.mjs` para reemplazar por **score de similitud** (no solo primera coincidencia por nivel).

### Nuevo scoring

- +4 si `level` coincide
- +3 si `prepTimeMin` difiere <= 10 min
- +1 si `prepTimeMin` difiere <= 20 min
- +1 a +3 por solapamiento de categorías de ingredientes (`Produce`, `Protein`, etc.)

La app ahora selecciona el candidato con mayor score entre los no usados en el día.

## Resultado esperado

- reemplazos más cercanos al perfil del plato original
- menor variación en dificultad y tiempo
- mejor continuidad del plan semanal

## Datos seed iniciales

- `docs/seed-meals-phase2.json`: catálogo seed base (CO/lunch)
- `scripts/generate-seed-meals-sql.mjs`: genera SQL idempotente
- `supabase/seed/20260216_phase2_seed_meals.sql`: salida lista para ejecutar
