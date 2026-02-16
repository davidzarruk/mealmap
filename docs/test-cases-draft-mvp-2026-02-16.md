# Q-001 — Test cases draft (auth, swipe, replace, consolidation)

Date: 2026-02-16
Tester role: Tester

## Auth
1. **Sign up success**
   - Steps: Register with new email/password.
   - Expected: Account created; session active.
2. **Sign in invalid password**
   - Steps: Use valid email + wrong password.
   - Expected: Error shown; no session.
3. **Logout**
   - Steps: Sign in then logout.
   - Expected: Session cleared; auth screen shown.

## Swipe approve flow
4. **Approve single card**
   - Steps: Open plan, swipe right first card.
   - Expected: Slot marked approved; progress increments.
5. **Approve all cards**
   - Steps: Approve all slots.
   - Expected: Completion state reached; shopping list action enabled.

## Replace flow
6. **Replace returns candidate**
   - Steps: Swipe left on a card.
   - Expected: New candidate appears for same slot.
7. **Replace maintains compatibility**
   - Steps: Replace multiple cards.
   - Expected: Replacement remains slot-compatible and avoids immediate duplicate IDs.

## Consolidation
8. **Duplicate ingredient merge**
   - Steps: Approve meals sharing ingredient+unit.
   - Expected: Single consolidated row with summed quantity.
9. **Category grouping**
   - Steps: Open shopping list.
   - Expected: Items grouped by category with totals.

## Persistence
10. **Reload latest approved plan**
    - Steps: Approve plan, close app, reopen.
    - Expected: Plan + shopping list restored.

## Security / isolation (smoke)
11. **RLS user isolation**
    - Steps: Query data under user A then user B.
    - Expected: No cross-user visibility.

## Non-functional smoke
12. **Action latency sanity**
    - Steps: Perform login, approve, replace, list load.
    - Expected: No action consistently >2.5s in normal conditions.
