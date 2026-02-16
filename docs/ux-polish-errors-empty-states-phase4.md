# F4-002 — UX Polish: Error/Empty States (Beta)

Fecha: 2026-02-16

## Cambios

- Auth SignUp:
  - normalización de error `over_email_send_rate_limit` a copy amigable y accionable.
  - fallback de error inesperado con instrucción clara de reintento.
- Auth SignIn:
  - fallback de error inesperado con CTA de recuperación.
- Ambos flujos (SignIn/SignUp):
  - captura de excepciones inesperadas con `logAppError(...)` para observabilidad.

## Resultado

- Menos mensajes técnicos crudos para beta testers.
- Mejor guidance de recuperación cuando algo falla.
- Errores inesperados quedan trazados para triage operativo.
