# F4-004 — iOS release preflight (DevOps/Release)

Fecha: 2026-02-16
Owner: DevOps/Release

## Resultado ejecutivo
**Preflight: FAIL controlado (esperado por placeholders externos).**

Comando ejecutado:
```bash
cd mobile
npm run validate:ios-release
```

Salida clave:
- `expo.extra.eas.projectId sigue en placeholder`
- `submit.production.ios.ascAppId en placeholder`
- `submit.production.ios.appleTeamId en placeholder`

## Placeholders/IDs faltantes (aislados)
1. `IOS_EAS_PROJECT_ID` → mapea a `app.json > expo.extra.eas.projectId`
2. `IOS_ASC_APP_ID` → mapea a `eas.json > submit.production.ios.ascAppId`
3. `IOS_APPLE_TEAM_ID` → mapea a `eas.json > submit.production.ios.appleTeamId`

## Checklist accionable final

### A. Completar IDs (owner: Apple account admin)
- Obtener EAS project ID real.
- Obtener App Store Connect App ID (ASC App ID).
- Confirmar Apple Team ID correcto para la cuenta de publicación.

### B. Aplicar IDs en repo (owner: DevOps)
```bash
cd mobile
IOS_EAS_PROJECT_ID="<real>" \
IOS_ASC_APP_ID="<real>" \
IOS_APPLE_TEAM_ID="<real>" \
npm run apply:ios-release-ids
```

### C. Revalidar preflight (owner: DevOps)
```bash
npm run validate:ios-release
```
Esperado: `✅ iOS release config base lista para EAS/TestFlight.`

### D. Pre-submit operativo (owner: Release manager)
- Verificar `ios.bundleIdentifier = com.mealmap.app`.
- Confirmar `version` y `buildNumber` acorde al release plan.
- Confirmar credenciales EAS/Apple vigentes.

### E. Build & submit dry-run (owner: Release manager)
- `eas build --platform ios --profile production`
- `eas submit --platform ios --profile production`
- Guardar links de build + estado de procesamiento TestFlight.

## Riesgo y mitigación
- **Riesgo:** bloqueo externo por falta de IDs de Apple/EAS.
- **Mitigación:** placeholders están explícitamente aislados; script idempotente (`apply:ios-release-ids`) listo para cierre rápido cuando lleguen los valores.
