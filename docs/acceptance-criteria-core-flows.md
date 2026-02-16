# T-PL-02 — Acceptance criteria for core flows

Date: 2026-02-16

## Scope
Core MVP flows from PRD FR-01..FR-10: auth, setup, plan/swipe/replace, details, shopping consolidation, persistence.

## AC-01 Auth (register/login/logout)
- Given a new email/password, when user signs up, then account is created and user is signed in.
- Given valid credentials, when user signs in, then user lands on main app flow.
- Given invalid credentials, when user signs in, then user sees explicit error and stays on auth screen.
- Given an authenticated user, when user logs out, then session is cleared and auth screens are shown.

## AC-02 Setup creation
- Given first run, when setup is opened, then defaults are: lunch on, breakfast off, dinner off, region Colombia.
- Given required fields valid, when user submits setup, then plan draft is created with selected horizon and constraints.
- Given invalid setup data (people/time out of supported ranges), when submit, then action is blocked with inline feedback.

## AC-03 Plan generation and card feed
- Given valid setup, when plan is generated, then app creates slots for selected horizon/meal types.
- Given monthly horizon, when plan is generated, then month is represented as weekly batches (4-5 weeks), not one 30-day single batch.
- Given generated slots, when user opens plan, then one card at a time is shown with progress indicator.

## AC-04 Swipe approve
- Given a visible candidate card, when user swipes right, then card is marked approved for that slot and progress increments.
- Given all slots approved, when final approval occurs, then user can access consolidated shopping list.

## AC-05 Swipe replace
- Given a visible candidate card, when user swipes left, then a replacement is returned for same slot.
- Replacement must be slot-compatible (same meal context; similar complexity/time profile where possible).
- Replacement must not duplicate already used candidate IDs for same planning pass unless pool exhaustion occurs.

## AC-06 Meal details
- Given a card, when user taps details, then title, ingredients, and short prep instructions are displayed.

## AC-07 Shopping list consolidation
- Given approved plan slots, when shopping list is generated/viewed, then ingredients are grouped by category and consolidated by normalized ingredient+unit key.
- Duplicate ingredient rows with same normalized key are merged and quantity summed.

## AC-08 Persistence/reload
- Given latest approved plan exists, when user reopens app, then plan and shopping list are restored.
- Data loaded must belong only to authenticated user (RLS isolation).

## AC-09 Performance and resilience
- Standard actions (auth state check, approve, replace, list view) should complete under p95 2.5s in normal conditions.
- On transient backend error, app shows recoverable message and allows retry without data corruption.
