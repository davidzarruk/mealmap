# T-LLM-01 Meal Generation Contract (Input/Output JSON)

## Purpose
Define a stable contract for generating weekly meals and replacement options compatible with Mealmap MVP screens.

## Input JSON

```json
{
  "version": "1.0",
  "locale": "en-US",
  "region": "colombia",
  "household": {
    "people": 2,
    "mealTypes": ["lunch"],
    "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  "constraints": {
    "maxPrepMinutes": 45,
    "cookingLevel": "Beginner",
    "allowInternational": true
  },
  "existingPlan": null,
  "replacementFor": null
}
```

## Output JSON

```json
{
  "version": "1.0",
  "plan": {
    "Mon": [
      {
        "id": "mon-1",
        "title": "Quick ajiaco",
        "prepTimeMin": 35,
        "level": "Beginner",
        "ingredients": [
          { "name": "Potato", "amount": 600, "unit": "g", "category": "Produce" }
        ],
        "shortPrep": "Boil potatoes and corn, add chicken, then simmer."
      }
    ]
  },
  "metadata": {
    "generatedAt": "2026-02-16T09:00:00Z",
    "model": "llm-provider/model-id",
    "notes": []
  }
}
```

## Field rules
- `version`: required string, currently `1.0`.
- `day keys`: one of `Mon|Tue|Wed|Thu|Fri|Sat|Sun`.
- `level`: one of `Beginner|Intermediate|Advanced`.
- `prepTimeMin`: integer > 0.
- `ingredients[].category`: one of `Produce|Protein|Pantry|Dairy`.
- `ingredients[].amount`: positive number.
- `id`: unique within the week plan.

## Replacement mode
When `replacementFor` is provided in input:
- Output should include at least 2 replacement candidates for same day/meal slot.
- Keep prep time within ±15 minutes of original.
- Keep level within same level or adjacent level.
- Prefer overlapping ingredients to preserve shopping list stability.

## Validation requirements
- JSON must be parseable without cleanup.
- No markdown wrappers in production responses.
- Reject if required fields are missing.
