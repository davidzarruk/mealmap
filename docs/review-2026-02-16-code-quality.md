# T-RVW-01 Code quality pass (2026-02-16)

## Scope reviewed
- `src/screens/plan/PlanScreen.tsx`
- `src/screens/shopping/ShoppingListScreen.tsx`
- new domain helper `src/domain/planFlow.mjs`
- test scripts under `scripts/`

## Changes applied
1. Extracted plan/swipe/consolidation logic into `src/domain/planFlow.mjs` to reduce UI-layer coupling.
2. Reused shared consolidation logic in Shopping List screen (removed duplicated local implementation).
3. Added integration tests for core plan flows:
   - create plan + approve all (`T-TST-02`)
   - replace flow (`T-TST-03`)
   - consolidated totals (`T-TST-04`)
4. Added `smoke:ios` command and script to run typecheck + tests and attempt simulator launch when host is macOS.
5. Fixed typing drift in `PlanScreen` map callback to keep TypeScript clean under strict settings.

## Validation executed
- `npm run smoke:ios` (pass on typecheck + tests; simulator launch correctly skipped on non-macOS host).

## Result
- No critical code-quality blockers found for MVP scope.
- Structure and testability improved with shared domain helpers.
