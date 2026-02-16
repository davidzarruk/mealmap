export type SubstitutionSuggestion = {
  name: string;
  note: string;
};

const SUBSTITUTION_MAP: Record<string, SubstitutionSuggestion[]> = {
  milk: [
    { name: 'Almond milk', note: 'Dairy-free, lighter taste' },
    { name: 'Oat milk', note: 'Creamy, good for cooking' },
    { name: 'Coconut milk', note: 'Rich, tropical flavor' },
  ],
  cheese: [
    { name: 'Nutritional yeast', note: 'Vegan, cheesy flavor' },
    { name: 'Cashew cream', note: 'Vegan, creamy texture' },
  ],
  butter: [
    { name: 'Olive oil', note: 'Heart-healthy fat' },
    { name: 'Coconut oil', note: 'Good for baking' },
    { name: 'Avocado', note: 'Creamy spread substitute' },
  ],
  'chicken breast': [
    { name: 'Turkey breast', note: 'Leaner protein' },
    { name: 'Tofu', note: 'Vegan option, press before cooking' },
    { name: 'Chickpeas', note: 'Plant-based, high fiber' },
  ],
  'chicken thigh': [
    { name: 'Turkey thigh', note: 'Similar texture' },
    { name: 'Tempeh', note: 'Fermented soy, nutty flavor' },
  ],
  beef: [
    { name: 'Turkey', note: 'Lower fat content' },
    { name: 'Lentils', note: 'Plant-based, great in stews' },
    { name: 'Mushrooms', note: 'Umami-rich, meaty texture' },
  ],
  'ground chicken': [
    { name: 'Ground turkey', note: 'Very similar taste' },
    { name: 'Black beans (mashed)', note: 'Plant-based burger option' },
  ],
  'ground beef': [
    { name: 'Ground turkey', note: 'Lower fat' },
    { name: 'Lentils', note: 'Plant-based, similar texture' },
  ],
  rice: [
    { name: 'Quinoa', note: 'Higher protein, complete amino acids' },
    { name: 'Cauliflower rice', note: 'Low-carb option' },
    { name: 'Couscous', note: 'Quick-cooking grain' },
  ],
  pasta: [
    { name: 'Zucchini noodles', note: 'Low-carb, gluten-free' },
    { name: 'Whole wheat pasta', note: 'More fiber' },
    { name: 'Lentil pasta', note: 'Gluten-free, high protein' },
  ],
  tortillas: [
    { name: 'Lettuce wraps', note: 'Low-carb option' },
    { name: 'Corn tortillas', note: 'Gluten-free' },
  ],
  'tortilla wrap': [
    { name: 'Lettuce leaves', note: 'Low-carb wrap' },
    { name: 'Rice paper', note: 'Gluten-free option' },
  ],
  potato: [
    { name: 'Sweet potato', note: 'More vitamins, lower GI' },
    { name: 'Cauliflower', note: 'Low-carb mash alternative' },
  ],
  egg: [
    { name: 'Chia egg (1 tbsp + 3 tbsp water)', note: 'Vegan binder' },
    { name: 'Flax egg (1 tbsp + 3 tbsp water)', note: 'Vegan binder' },
  ],
  tuna: [
    { name: 'Chickpeas (mashed)', note: 'Vegan tuna salad' },
    { name: 'Salmon', note: 'Higher omega-3' },
  ],
  'soy sauce': [
    { name: 'Coconut aminos', note: 'Soy-free, lower sodium' },
    { name: 'Tamari', note: 'Gluten-free soy sauce' },
  ],
  cream: [
    { name: 'Coconut cream', note: 'Dairy-free, rich' },
    { name: 'Cashew cream', note: 'Nutty, vegan' },
  ],
  'coconut milk': [
    { name: 'Oat milk + coconut extract', note: 'Nut-free option' },
    { name: 'Cashew milk', note: 'Creamy alternative' },
  ],
};

export function getSubstitutions(ingredientName: string): SubstitutionSuggestion[] {
  const key = ingredientName.toLowerCase().trim();
  return SUBSTITUTION_MAP[key] ?? [];
}

export function hasSubstitutions(ingredientName: string): boolean {
  return getSubstitutions(ingredientName).length > 0;
}
