# Fase 2 · iOS release readiness (EAS + TestFlight)

## Configuración base implementada

- `mobile/app.json`
  - `expo.name=Mealmap`
  - `expo.slug=mealmap`
  - `ios.bundleIdentifier=com.mealmap.app`
  - `ios.buildNumber=1`
  - `ios.infoPlist.ITSAppUsesNonExemptEncryption=false`
  - `expo.extra.eas.projectId` (placeholder a completar)
- `mobile/eas.json`
  - perfiles `preview` y `production`
  - `submit.production.ios.ascAppId` (placeholder)
  - `submit.production.ios.appleTeamId` (placeholder)
- script de validación: `npm run validate:ios-release`

## Checklist EAS/TestFlight

1. **Completar IDs reales (sin editar manualmente)**
   - Exportar variables:
     - `IOS_EAS_PROJECT_ID`
     - `IOS_ASC_APP_ID`
     - `IOS_APPLE_TEAM_ID`
   - Ejecutar: `npm --prefix mobile run apply:ios-release-ids`
   - Validar: `npm --prefix mobile run validate:ios-release`
2. **Autenticación Apple**
   - `eas login`
   - `eas credentials` (crear/validar certs + provisioning)
3. **Build de producción**
   - `eas build -p ios --profile production`
4. **Subida a TestFlight**
   - `eas submit -p ios --profile production`
5. **Validación en App Store Connect**
   - estado build procesado
   - metadata mínima de beta
   - tester groups y notas de release
6. **Smoke en TestFlight**
   - login/signup
   - setup inicial
   - swipe approve/replace
   - shopping list

## Criterio de cierre del bloque

- Configuración base versionada ✅
- Checklist operativo en repo ✅
- Validación automatizada para detectar placeholders ✅

## Estado operativo actual

- Flujo automatizado para inyectar IDs reales ya disponible (`apply:ios-release-ids`).
- **Bloqueo externo**: faltan valores reales de Apple/EAS (Project ID / ASC App ID / Apple Team ID) para completar `app.json` y `eas.json` en este entorno.
- Al recibir esos 3 IDs, el cierre técnico se ejecuta en minutos con el comando anterior.
