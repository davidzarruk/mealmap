# T-LLM-03 Ingredient Normalization Rules (Shopping Consolidation)

## Goal
Normalize ingredient names/units so shopping list totals merge correctly and avoid duplicates like `Tomate` vs `tomatoes`.

## Pipeline
1. **Trim and lowercase** raw ingredient name.
2. **Remove accents/diacritics** (e.g., `cebollín` -> `cebollin`).
3. **Singularize** common plural forms (`tomatoes` -> `tomato`, `papas` -> `papa` where locale mapping applies).
4. **Map synonyms** to canonical key.
5. **Standardize unit** to canonical measurement unit.
6. **Convert quantity** using unit conversion table.
7. **Round totals** with deterministic rules.

## Canonical schema

```json
{
  "rawName": "Tomates",
  "canonicalName": "tomato",
  "displayName": "Tomato",
  "category": "Produce",
  "rawAmount": 2,
  "rawUnit": "units",
  "canonicalAmount": 240,
  "canonicalUnit": "g"
}
```

## Synonym map (starter)
- `tomate`, `tomates`, `jitomate` -> `tomato`
- `cebolla cabezona`, `onion`, `cebollas` -> `onion`
- `papa`, `papas`, `potato`, `potatoes` -> `potato`
- `pechuga de pollo`, `chicken breast`, `pollo` -> `chicken`
- `arroz`, `rice` -> `rice`
- `aceite vegetal`, `vegetable oil`, `oil` -> `vegetable oil`

## Unit normalization
Canonical units by ingredient type:
- Solids: `g`
- Liquids: `ml`
- Countables: `unit`

Examples:
- `1 kg` -> `1000 g`
- `0.5 kg` -> `500 g`
- `1 l` -> `1000 ml`
- `1 tbsp oil` -> `15 ml`
- `1 tsp salt` -> `5 ml` (or density-based grams if configured)

## Merge key
Use composite key:

`{canonicalName}::{canonicalUnit}`

Only merge when key matches exactly.

## Rounding rules
- Per-item converted amount: keep 2 decimals internal.
- Final aggregated display:
  - `g/ml`: round to nearest whole number.
  - `unit`: round up to nearest 0.5 when fractional counts appear.

## Category fallback
If category missing:
1. Lookup by canonical ingredient dictionary.
2. If absent, set `Pantry`.

## Rejection criteria
Reject ingredient row if:
- name empty after normalization,
- amount <= 0,
- unknown unit with no conversion path.

Attach warning in metadata for rejected rows.
