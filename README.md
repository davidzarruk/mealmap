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
├── supabase/
│   ├── migrations/          # Schema SQL
│   ├── functions/           # Edge Functions
│   └── seed/                # Datos de prueba
├── docs/                    # Documentación
├── scripts/                 # Scripts utilitarios
├── PRD.md                   # Especificaciones del producto
├── BACKLOG_STATUS.md        # Estado de tickets
└── board.md                 # Kanban (desactualizado)
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

**Lovable UI conectado a Supabase** es la fuente de verdad para:
- Estado de tickets
- Progreso del proyecto
- Dependencias entre tareas

**NO usar `board.md`** - puede estar desactualizado.

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
