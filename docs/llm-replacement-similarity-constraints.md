# T-LLM-02 Similarity Constraints for Replacements

## Objective
When a user swipes left (replace), return candidates that feel "similar enough" to the rejected meal while still offering variety.

## Similarity dimensions
For an original meal `M0` and replacement candidate `M1`, compute a weighted similarity score in `[0, 1]`:

- **Meal slot compatibility (hard constraint):** same `meal_type` (lunch/breakfast/dinner)
- **Cuisine family:** same family preferred (Colombian/LatAm/International light)
- **Protein profile:** same dominant protein class (chicken/beef/fish/vegetarian/egg)
- **Prep-time proximity:** absolute delta in minutes
- **Cooking complexity:** level distance (Beginner/Intermediate/Advanced)
- **Ingredient overlap:** Jaccard overlap on normalized ingredient names
- **Method similarity:** boil/stew/grill/bake/stir-fry categories

Suggested weights:

- Protein profile: `0.25`
- Prep-time proximity: `0.20`
- Ingredient overlap: `0.20`
- Cuisine family: `0.15`
- Method similarity: `0.10`
- Complexity proximity: `0.10`

## Hard constraints (must pass)
1. `meal_type` must match the slot.
2. `prep_time_min` must be within **±15 min** of original (or ±20 if no results).
3. `level` must be equal or adjacent (Beginner↔Intermediate↔Advanced).
4. Ingredient list must be parseable and normalized (see T-LLM-03).

## Acceptance threshold
- Primary acceptance: `similarity_score >= 0.65`
- Fallback acceptance (if catalog sparse): `>= 0.55` with explicit `fallback: true` in metadata.

## Candidate generation policy
1. Query top 12 candidates by embedding/feature similarity.
2. Apply hard constraints.
3. Re-rank by weighted score.
4. Return top 2–3 candidates.
5. Exclude previously rejected candidate IDs for same slot/session.

## Anti-repeat rules
- Do not return the same meal ID twice in one slot session.
- Penalize exact title duplicates across same day.
- Cap repeated dominant protein to max 2 per week for lunch-only plans (soft rule).

## Output additions (replacement mode)
Each replacement candidate should include:

```json
{
  "id": "...",
  "similarityScore": 0.72,
  "similarityBreakdown": {
    "protein": 1,
    "prepTime": 0.9,
    "ingredientOverlap": 0.58,
    "cuisine": 1,
    "method": 0.5,
    "complexity": 1
  },
  "fallback": false
}
```

## Validation checklist
- [ ] Same slot type as original
- [ ] Prep time within accepted range
- [ ] Level compatible
- [ ] Score threshold met
- [ ] Not previously rejected in current slot
