# T-PL-03 — Error states and fallback UX

Date: 2026-02-16

## Principles
- Never block user without clear reason.
- Every failure path should offer retry/back.
- Keep copy short, explicit, and actionable.

## Error matrix

### 1) Auth errors
- **Invalid credentials**: “Email or password is incorrect.”
  - Actions: Retry, Reset password (phase-2), Back.
- **Network/auth service unavailable**: “Couldn’t reach authentication service.”
  - Actions: Retry.

### 2) Setup validation errors
- **People count out of range**: “People must be between 1 and 6.”
- **No meal type selected**: “Select at least one meal type.”
- **Invalid max time**: “Choose one of 15, 30, 45, 60 min.”
  - Actions: Inline field errors + disable submit until valid.

### 3) Plan generation errors
- **Generation timeout/failure**: “We couldn’t generate your plan right now.”
  - Actions: Retry generation, return to setup.
- **Partial slot generation**: “Some meals are still loading.”
  - Actions: Skeleton placeholders + retry unresolved slots.

### 4) Replace flow errors
- **No replacement available in pool**: “No similar option available right now.”
  - Actions: Keep current meal, retry replace, allow fallback candidate.
- **Backend replace error**: “Couldn’t replace this meal.”
  - Actions: Retry replace.

### 5) Shopping list errors
- **Consolidation failure**: “We couldn’t build your shopping list.”
  - Actions: Retry generation from approved plan.
- **Empty approved set**: “Approve meals to generate your shopping list.”
  - Actions: Go to plan.

### 6) Persistence/session errors
- **Restore failed**: “Couldn’t restore your last plan.”
  - Actions: Retry restore, start new plan.
- **Session expired**: “Your session expired. Please sign in again.”
  - Actions: Go to Sign in.

## Fallback UX decisions
- Preserve user progress locally while transient errors are retried.
- Keep last known good card/list visible when a refresh fails.
- Use non-blocking banners for retriable failures; modal only for destructive/session reset cases.
- Expose lightweight loading states (skeletons/spinner) for generate/replace/list.
