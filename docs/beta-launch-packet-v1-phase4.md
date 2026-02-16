# F4-005 — Beta Launch Packet v1 (PM/QA)

Fecha: 2026-02-16
Versión: v1
Owner: PM/QA

## 1) Objetivo del beta
Validar estabilidad del flujo core de Mealmap (Auth → Setup → Plan con swipe/replace → Shopping list) y capturar feedback accionable antes de apertura más amplia.

## 2) Alcance de testing (in-scope)
- Registro/login/logout.
- Setup inicial y persistencia.
- Generación de plan semanal.
- Swipe approve / replace (similitud razonable).
- Lista de compras consolidada + edición manual.
- Mensajes de error/empty states y recuperación.

Fuera de alcance (v1):
- Android release formal.
- Optimización avanzada de performance no bloqueante.
- Features post-MVP no incluidas en PRD v1.

## 3) Entry criteria (para abrir beta)
- Smoke playbook PASS.
- Sin P0 abiertos.
- Preflight iOS ejecutado con plan claro para placeholders/IDs faltantes.
- Canal de reporte de bugs definido.

## 4) Go-to-market beta (cerrada)
- Cohorte inicial sugerida: 10–25 testers.
- Perfil: iPhone users con hábitos de cocina semanales.
- Duración ola 1: 5–7 días.
- Cadencia de triage: diaria.

## 5) Instrucciones para testers (mensaje corto)
"Instala Mealmap desde TestFlight, completa setup, arma un plan de 7 días, haz al menos 2 swipes approve y 1 replace, revisa la lista de compras y reporta cualquier error o fricción en el formulario/canal de feedback."

## 6) Plantilla de reporte de bug (tester)
- Título:
- Dispositivo iOS + versión:
- Build de Mealmap:
- Pasos para reproducir:
- Resultado esperado:
- Resultado actual:
- Severidad (Alta/Media/Baja):
- Evidencia (screenshot/video):

## 7) Triage rubric (PM/QA)
- **P0:** app no usable, crash en flujo core, pérdida de sesión/datos críticos.
- **P1:** flujo core degradado sin workaround claro.
- **P2:** bug funcional con workaround.
- **P3:** UI/copy/pulido sin impacto crítico.

SLA sugerido:
- P0: inmediato (<4h)
- P1: mismo día
- P2: 24–48h
- P3: backlog priorizado

## 8) Daily ops pack
- Ejecutar daily beta report template.
- Registrar decisiones go/hold diarias.
- Publicar top 3 riesgos + plan de mitigación.

## 9) Exit criteria beta v1
- 0 P0 abiertos por 3 días consecutivos.
- >=90% smoke pass rate en período de beta.
- Top issues P1 con owner y fecha comprometida.
- Decisión documentada: ampliar beta / preparar release candidate.

## 10) Handoff checklist
- [ ] Último daily report emitido.
- [ ] Estado de bugs por severidad actualizado.
- [ ] Evidencias smoke consolidadas.
- [ ] Decisión go/no-go documentada.
- [ ] Próximos pasos y responsables asignados.
