# 🍽️ Mealmap

**Estado:** ⏸️ PAUSADO (Feb 2026) - Enfocado en DataRunner

App móvil para planificación semanal de comidas con interfaz tipo Tinder.

---

## ⚠️ IMPORTANTE

**Este proyecto está PAUSADO desde Feb 17, 2026.**

Razón: Enfoque total en DataRunner MVP.

**Último build:** #4 (852b3c51) - Android APK en Expo

**Para retomar:**
1. Verificar credenciales de Supabase (ver abajo)
2. Revisar BACKLOG_STATUS.md para tickets pendientes
3. Revisar PRD.md para especificaciones completas

---

## 📦 Stack

- **React Native** + **Expo**
- **TypeScript**
- **Supabase** (PostgreSQL + Auth + RLS + Edge Functions)
- **React Navigation**

---

## 🔧 Configuración de Supabase

### Proyecto Actual

- **URL:** https://supabase.com/dashboard/project/cxhpvtwxpgpflgqylgsi
- **Owner ID:** 095ea886-c636-4677-b786-61f5eb93b4fc

### Credenciales Necesarias

**Para desarrollo local:**
```bash
# .env o app.json
SUPABASE_URL=https://cxhpvtwxpgpflgqylgsi.supabase.co
SUPABASE_ANON_KEY=<obtener de Settings → API>
```

**Para Edge Functions:**
```bash
SUPABASE_SERVICE_ROLE_KEY=<obtener de Settings → API>
```

### Schema SQL

**Migraciones disponibles en:**
```
supabase/migrations/
```

**Para aplicar schema:**
```bash
# Opción 1: Supabase CLI
supabase db push

# Opción 2: Manual en SQL Editor
# Copiar contenido de migrations/*.sql y ejecutar en orden
```

**Tablas principales:**
- `users` (Supabase Auth)
- `plans`
- `plan_slots`
- `meal_candidates`
- `shopping_lists`
- `shopping_items`

Ver `PRD.md` sección 9 para modelo de datos completo.

---

## 📋 Sistema Kanban (Gestión de Proyecto)

### Kanban Web App

**Ubicación:** `/kanban-web/`

**Stack:**
- HTML + CSS + JavaScript vanilla
- Supabase Realtime (actualización automática)
- LocalStorage para credenciales

**Funcionalidad:**
- Tablero visual: Backlog → Next → In Progress → In Review → QA → Done
- Actualización en tiempo real (sin refresh)
- Mover tickets entre columnas
- Log automático de cambios en `ticket_events`

### Ejecutar Kanban Local

```bash
cd kanban-web
python3 -m http.server 4173
# Abrir: http://localhost:4173
```

**Primera vez te pedirá:**
- Supabase URL: `https://cxhpvtwxpgpflgqylgsi.supabase.co`
- Supabase Anon Key (pedir a David)
- Owner UUID (tu user ID de Supabase Auth)

**Valores se guardan en localStorage.**

### Deploy a Producción

**URL objetivo:** `kanban.davidzarruk.com`

**Plataforma:** Lovable (static hosting)

**Checklist completo en:**
`/docs/deploy-checklist-kanban-davidzarruk-com.md`

**Pasos:**
1. Aplicar migración SQL: `supabase/migrations/20260216092000_kanban_live.sql`
2. Publicar archivos de `kanban-web/` en Lovable
3. Configurar CNAME en Namecheap: `kanban` → Lovable hostname
4. Verificar SSL/HTTPS

### Sincronizar board.md → Supabase

**Script:** `/scripts/preflight-kanban-supabase.mjs`

```bash
cd mealmap
SUPABASE_URL="https://cxhpvtwxpgpflgqylgsi.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="..." \
SUPABASE_OWNER_ID="..." \
node scripts/preflight-kanban-supabase.mjs
```

**⚠️ IMPORTANTE:**
- `board.md` puede estar desactualizado
- **Fuente de verdad:** Supabase + Kanban Web
- NO usar `board.md` como referencia de estado actual

### Tablas en Supabase

**Schema:** `supabase/migrations/20260216092000_kanban_live.sql`

**Tablas:**
- `tickets` - Tickets del kanban
- `ticket_events` - Historial de cambios/actividad

**Verificar en SQL Editor:**
```sql
SELECT COUNT(*) FROM tickets WHERE project = 'mealmap';
SELECT * FROM tickets ORDER BY created_at DESC LIMIT 10;
```

### Integración con DataRunner

**DataRunner usa el mismo Kanban** (proyecto Mealmap de Supabase).

**Script de setup:** `/root/.openclaw/workspace/datarunner-kanban-setup.ts`

**Crea 12 tickets de DataRunner** en el Kanban compartido (#001-#012).

```bash
cd /root/.openclaw/workspace
MEALMAP_SERVICE_KEY="..." npx tsx datarunner-kanban-setup.ts
```

**Ver tickets:** https://supabase.com/dashboard/project/cxhpvtwxpgpflgqylgsi/editor

---

## 🚀 Setup (si se retoma)

### 1. Instalar dependencias

```bash
cd mobile
npm install
```

### 2. Configurar Supabase

1. Ir a: https://supabase.com/dashboard/project/cxhpvtwxpgpflgqylgsi
2. Settings → API
3. Copiar `Project URL` y `anon public` key
4. Actualizar en `mobile/app.json`:

```json
"extra": {
  "supabaseUrl": "https://cxhpvtwxpgpflgqylgsi.supabase.co",
  "supabaseAnonKey": "TU_ANON_KEY"
}
```

### 3. Verificar schema

```bash
# En SQL Editor de Supabase
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

# Debe mostrar: plans, plan_slots, meal_candidates, shopping_lists, shopping_items
```

### 4. Ejecutar app

```bash
cd mobile
npx expo start
```

---

## 📁 Estructura del Proyecto

```
mealmap/
├── mobile/                  # App React Native
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── app.json
├── kanban-web/              # 📋 Kanban Web App (IMPORTANTE)
│   ├── index.html           # Página principal
│   ├── app.js               # Lógica + Supabase Realtime
│   ├── styles.css
│   └── README.md            # Instrucciones de uso
├── supabase/
│   ├── migrations/
│   │   ├── 20260216092000_kanban_live.sql  # Schema Kanban
│   │   └── ...              # Otras migraciones
│   ├── functions/           # Edge Functions
│   └── seed/                # Datos de prueba
├── docs/
│   ├── deploy-checklist-kanban-davidzarruk-com.md  # Deploy Kanban
│   └── ...                  # Otra documentación
├── scripts/
│   ├── preflight-kanban-supabase.mjs  # Sync board.md → Supabase
│   └── ...                  # Otros scripts
├── PRD.md                   # Especificaciones del producto
├── BACKLOG_STATUS.md        # Estado de tickets
└── board.md                 # ⚠️ Kanban (DESACTUALIZADO - no usar)
```

---

## 📋 Estado del Proyecto

### ✅ Completado

**Fundación (M1):**
- ✅ Estructura base de React Native + Expo
- ✅ Integración con Supabase
- ✅ Autenticación básica
- ✅ Schema de base de datos

**Planeación (M2):**
- ✅ Flujo de setup de plan
- ✅ UI de cards swipeables
- ✅ Sistema de navegación

**Build:**
- ✅ Build #4 en Expo (Android APK disponible)

### ⏳ Pendiente (según BACKLOG_STATUS.md)

**Alta prioridad:**
- Lógica de reemplazo de meals (swipe left)
- Consolidación de shopping list
- Validación de plan completo
- Edge Function para generación de meals

**Media prioridad:**
- Mejoras de UX en cards
- Categorización de shopping list
- Persistencia de planes

**Baja prioridad:**
- Modos de visualización alternativos
- Integración con proveedores (Phase 2)
- Scoring nutricional (Phase 2)

Ver `BACKLOG_STATUS.md` para detalles completos.

---

## 🗂️ Documentación Disponible

| Archivo | Propósito |
|---------|-----------|
| `PRD.md` | Product Requirements Document completo |
| `BACKLOG_STATUS.md` | Estado de todos los tickets |
| `QUICKSTART_TICKETS.md` | Guía rápida de tickets pendientes |
| `BATCH2_DESCRIPTIONS_MANUAL.md` | Descripciones de batch 2 |
| `BATCH3_DESCRIPTIONS_MANUAL.md` | Descripciones de batch 3 |
| `TICKETS_REPORT_FINAL.md` | Reporte final de tickets |
| `board.md` | Kanban (puede estar desactualizado) |

---

## 🎯 Producto Final (según PRD)

**Mealmap es una app que:**

1. ✅ Usuario crea plan semanal (días, personas, comidas)
2. ✅ Sistema genera sugerencias de meals en formato cards
3. ⏳ Usuario aprueba (swipe →) o rechaza (swipe ←)
4. ⏳ Sistema reemplaza meals rechazadas con similares
5. ⏳ Al completar, genera shopping list consolidada
6. ⏳ Usuario puede ver/guardar/reabrir planes

**Target:** Personas en Colombia planificando comidas semanales desde el móvil.

---

## 🔑 Credenciales y URLs

**Supabase:**
- Project: https://supabase.com/dashboard/project/cxhpvtwxpgpflgqylgsi
- Owner: 095ea886-c636-4677-b786-61f5eb93b4fc

**Expo:**
- Build #4: 852b3c51 (Android APK)
- Proyecto: (verificar en mobile/app.json)

**GitHub:**
- Repo: https://github.com/davidzarruk/mealmap (privado)

---

## 🚦 Kanban System

**Sistema completo de gestión de tickets.**

**Fuente de verdad:** Supabase (`tickets` + `ticket_events`)

**Interfaces:**
- 📱 Kanban Web App (`/kanban-web/`) - Tablero visual en vivo
- 🌐 Producción: `kanban.davidzarruk.com` (cuando esté deployado)
- 🗄️ Supabase Tables: Acceso directo vía SQL Editor

**⚠️ NO usar `board.md`** - está desactualizado.

**Ver sección "📋 Sistema Kanban" arriba** para instrucciones completas de:
- Cómo ejecutar local
- Deploy a producción
- Sincronización de datos
- Integración con DataRunner

---

## 💡 Para Retomar el Proyecto

**Checklist:**

1. [ ] Obtener credenciales de Supabase actualizadas
2. [ ] Verificar schema en Supabase (ejecutar migrations si necesario)
3. [ ] Actualizar `mobile/app.json` con credenciales
4. [ ] Revisar `BACKLOG_STATUS.md` para prioridades
5. [ ] Decidir: ¿continuar o dejar pausado?

**Si decides continuar:**
- Prioridad 1: Lógica de reemplazo (swipe left)
- Prioridad 2: Shopping list consolidation
- Prioridad 3: Edge Function para meal generation

**Tiempo estimado para MVP:** 3-4 semanas de desarrollo enfocado

---

## 🧠 Contexto Importante

**Decisión de Feb 17, 2026:**
- Pausar Mealmap indefinidamente
- Enfoque 100% en DataRunner MVP
- Razón: Token efficiency + faster iteration en proyecto más simple

**Última actividad:**
- Build #4 completado
- Schema SQL estable
- App funcional pero incompleta (falta lógica core)

**No hay urgencia por retomar** - DataRunner es prioridad.

---

## 📞 Contacto

Desarrollado por David Zarruk

---

**💬 Para el nuevo Claw:**

Si David pregunta por Mealmap:
1. Estado: PAUSADO (Feb 17, 2026)
2. Enfoque actual: DataRunner
3. Para retomar: seguir checklist arriba
4. No hay prisa - es decisión estratégica

Si quiere credenciales:
- Supabase URL: https://cxhpvtwxpgpflgqylgsi.supabase.co
- API key: (pedir a David - Settings → API en Supabase)

Todo documentado en este README + archivos /docs.
