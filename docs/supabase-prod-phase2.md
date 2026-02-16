# Fase 2 · Backend productivo Supabase

## Objetivo
Definir procedimiento reproducible de promoción a prod y validaciones mínimas post-release.

## Checklist operativo

1. **Proyecto y seguridad**
   - Proyecto prod separado de dev/staging
   - RLS habilitado en todas las tablas de negocio
   - `anon` key solo en cliente, `service_role` solo en backend seguro
2. **Migraciones**
   - Aplicar `supabase/migrations/*` en orden
   - Verificar tablas core: `profiles`, `plans`, `plan_meals`, `shopping_lists`, `shopping_items`
   - Verificar kanban live: `tickets`, `ticket_events`
3. **Realtime / publicación**
   - Validar tablas incluidas en publication para realtime
4. **Backups y rollback**
   - backup previo a cambios estructurales
   - rollback documentado por versión de migración
5. **Monitoreo mínimo**
   - latencia API REST
   - errores auth
   - cuota de base y storage

## Validación automatizada incluida

Script: `npm run validate:supabase-prod`

Valida (baseline):
- conectividad REST
- lectura head de tablas core (`profiles`, `plans`)
- presencia de tabla `ticket_events` (sanity de migración kanban/realtime)

Valida (deep, opcional con `SUPABASE_SERVICE_ROLE_KEY`):
- creación de 2 usuarios temporales (`auth.admin.createUser`)
- inserción de planes por usuario con service role
- verificación de aislamiento RLS (usuario A no puede leer planes de usuario B)
- verificación de bloqueo de update malicioso (`user_id` cruzado)
- cleanup de usuarios temporales (`auth.admin.deleteUser`)

## Variables requeridas

- `SUPABASE_URL` (o `EXPO_PUBLIC_SUPABASE_URL`)
- `SUPABASE_ANON_KEY` (o `EXPO_PUBLIC_SUPABASE_ANON_KEY`)

## Bloqueos conocidos

- Para validaciones administrativas (policies profundas, índices, publication exacta) se requiere `SUPABASE_SERVICE_ROLE_KEY` y/o acceso owner SQL.
- Si falta ese acceso, correr validaciones baseline y registrar gap para cierre infra.
