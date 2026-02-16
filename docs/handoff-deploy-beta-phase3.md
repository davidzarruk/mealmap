# Handoff deploy + beta (Phase 3)

Fecha: 2026-02-16 UTC  
Owner: mealmap-autoloop-continuous

## 0) Gate de entrada (obligatorio)
- [ ] `npm --prefix mobile run validate:env`
- [ ] `npm --prefix mobile run validate:ios-release`
- [ ] `npm run validate:supabase-prod`
- [ ] Si `validate:supabase-prod` reporta deep-check omitido: exportar `SUPABASE_SERVICE_ROLE_KEY` y re-ejecutar.

## 1) iOS release ids (sin edición manual)
- [ ] Exportar:
  - [ ] `IOS_EAS_PROJECT_ID`
  - [ ] `IOS_ASC_APP_ID`
  - [ ] `IOS_APPLE_TEAM_ID`
- [ ] Ejecutar: `npm --prefix mobile run apply:ios-release-ids`
- [ ] Confirmar: `npm --prefix mobile run validate:ios-release`

## 2) Build + submit
- [ ] `cd mobile && eas login`
- [ ] `cd mobile && eas build -p ios --profile production`
- [ ] `cd mobile && eas submit -p ios --profile production`
- [ ] Verificar build procesado en App Store Connect

## 3) Beta QA smoke (TestFlight)
- [ ] Auth: signup/login/logout
- [ ] Setup: defaults + guardrails
- [ ] Plan: swipe approve/replace
- [ ] Shopping list: consolidación + edición manual de ingrediente
- [ ] Favorites + onboarding tooltips

## 4) Supabase prod validation
- [ ] Confirmar tabla `ticket_events` disponible en proyecto objetivo
- [ ] Verificar RLS isolation (deep check)
- [ ] Guardar evidencia (salida de consola + timestamp)

## 5) Criterio de GO/NO-GO
### GO
- Todos los checks de secciones 0–4 en verde.
- Sin regresiones P0/P1 abiertas.

### NO-GO
- Falla en validación iOS release config.
- Falla en conectividad Supabase o en aislamiento RLS.
- Errores críticos en smoke de TestFlight.

## 6) Evidencias mínimas a adjuntar al handoff
- [ ] Hash commit
- [ ] Salida `validate:ios-release`
- [ ] Salida `validate:supabase-prod`
- [ ] Captura/TestFlight build number
- [ ] Lista de bloqueos residuales (si aplica)
