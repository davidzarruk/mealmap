import { MealCard, IngredientItem } from '../data/plan';

// ─── Mock LLM meal search ───
// Structured so swapping in a real LLM API is trivial:
// just replace `searchMealsFromLLM` implementation.

export interface MealSearchProvider {
  search(query: string, mealType?: string): Promise<MealCard[]>;
}

const ing = (
  name: string,
  amount: number,
  unit: string,
  category: IngredientItem['category'],
): IngredientItem => ({ name, amount, unit, category });

// Curated mock responses keyed by keywords
const MOCK_CATALOG: Record<string, MealCard[]> = {
  chicken: [
    { id: 'llm-chicken-1', title: 'Grilled lemon chicken', description: 'Juicy chicken breast marinated in lemon, garlic and herbs, grilled to perfection.', prepTimeMin: 25, level: 'Beginner', ingredients: [ing('Chicken breast', 400, 'g', 'Protein'), ing('Lemon', 2, 'unit', 'Produce'), ing('Garlic', 3, 'clove', 'Produce')], shortPrep: 'Marinate chicken, grill 6 min per side.' },
    { id: 'llm-chicken-2', title: 'Chicken teriyaki bowl', description: 'Tender chicken glazed in sweet teriyaki sauce over steamed rice with vegetables.', prepTimeMin: 30, level: 'Beginner', ingredients: [ing('Chicken breast', 350, 'g', 'Protein'), ing('Rice', 300, 'g', 'Pantry'), ing('Soy sauce', 40, 'ml', 'Pantry')], shortPrep: 'Cook chicken in teriyaki glaze, serve over rice.' },
  ],
  pasta: [
    { id: 'llm-pasta-1', title: 'Creamy garlic pasta', description: 'Rich and creamy garlic parmesan pasta ready in under 20 minutes.', prepTimeMin: 18, level: 'Beginner', ingredients: [ing('Pasta', 350, 'g', 'Pantry'), ing('Garlic', 4, 'clove', 'Produce'), ing('Cream', 200, 'ml', 'Dairy')], shortPrep: 'Cook pasta, sauté garlic in cream, combine.' },
    { id: 'llm-pasta-2', title: 'Pesto penne', description: 'Quick penne tossed with fresh basil pesto and cherry tomatoes.', prepTimeMin: 15, level: 'Beginner', ingredients: [ing('Pasta', 320, 'g', 'Pantry'), ing('Basil', 30, 'g', 'Produce'), ing('Tomato', 2, 'unit', 'Produce')], shortPrep: 'Blend pesto, cook pasta, toss together.' },
  ],
  salad: [
    { id: 'llm-salad-1', title: 'Mediterranean salad bowl', description: 'Fresh mixed greens with feta, olives, cucumber and tangy vinaigrette.', prepTimeMin: 10, level: 'Beginner', ingredients: [ing('Lettuce', 1, 'unit', 'Produce'), ing('Cheese', 100, 'g', 'Dairy'), ing('Tomato', 2, 'unit', 'Produce')], shortPrep: 'Chop vegetables, crumble cheese, dress and toss.' },
  ],
  vegan: [
    { id: 'llm-vegan-1', title: 'Buddha bowl', description: 'Colorful bowl with roasted sweet potato, quinoa, avocado and tahini dressing.', prepTimeMin: 35, level: 'Intermediate', ingredients: [ing('Quinoa', 200, 'g', 'Pantry'), ing('Avocado', 1, 'unit', 'Produce'), ing('Sweet potato', 300, 'g', 'Produce')], shortPrep: 'Roast sweet potato, cook quinoa, assemble bowl.' },
  ],
  soup: [
    { id: 'llm-soup-1', title: 'Minestrone soup', description: 'Hearty Italian vegetable soup with beans, pasta and fresh herbs.', prepTimeMin: 40, level: 'Beginner', ingredients: [ing('Beans', 250, 'g', 'Pantry'), ing('Pasta', 100, 'g', 'Pantry'), ing('Carrot', 2, 'unit', 'Produce')], shortPrep: 'Sauté vegetables, add beans and broth, simmer.' },
  ],
  breakfast: [
    { id: 'llm-break-1', title: 'Avocado toast with egg', description: 'Crispy toast topped with smashed avocado and a perfectly poached egg.', prepTimeMin: 10, level: 'Beginner', ingredients: [ing('Bread', 2, 'slice', 'Pantry'), ing('Avocado', 1, 'unit', 'Produce'), ing('Egg', 2, 'unit', 'Protein')], shortPrep: 'Toast bread, smash avocado, poach eggs, assemble.' },
    { id: 'llm-break-2', title: 'Banana pancakes', description: 'Fluffy pancakes made with ripe bananas and a hint of cinnamon.', prepTimeMin: 15, level: 'Beginner', ingredients: [ing('Banana', 2, 'unit', 'Produce'), ing('Egg', 2, 'unit', 'Protein'), ing('Flour', 150, 'g', 'Pantry')], shortPrep: 'Mash bananas, mix batter, cook on griddle.' },
  ],
  default: [
    { id: 'llm-def-1', title: 'One-pan rice and beans', description: 'Simple comfort meal of seasoned rice and beans cooked together in one pan.', prepTimeMin: 25, level: 'Beginner', ingredients: [ing('Rice', 300, 'g', 'Pantry'), ing('Beans', 250, 'g', 'Pantry'), ing('Onion', 1, 'unit', 'Produce')], shortPrep: 'Cook rice and beans together with spices.' },
    { id: 'llm-def-2', title: 'Grilled cheese sandwich', description: 'Golden crispy sandwich with melted cheese and a side of tomato soup.', prepTimeMin: 12, level: 'Beginner', ingredients: [ing('Bread', 4, 'slice', 'Pantry'), ing('Cheese', 120, 'g', 'Dairy'), ing('Butter', 30, 'g', 'Dairy')], shortPrep: 'Butter bread, add cheese, grill until melted.' },
  ],
};

class MockLLMProvider implements MealSearchProvider {
  async search(query: string, mealType?: string): Promise<MealCard[]> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 300));

    const q = query.toLowerCase();
    let results: MealCard[] = [];

    // Match keywords
    for (const [keyword, meals] of Object.entries(MOCK_CATALOG)) {
      if (keyword === 'default') continue;
      if (q.includes(keyword)) {
        results.push(...meals);
      }
    }

    // If mealType is breakfast, add breakfast items
    if (mealType === 'Breakfast' || q.includes('breakfast')) {
      results.push(...(MOCK_CATALOG.breakfast ?? []));
    }

    // Fallback to default
    if (results.length === 0) {
      results = [...(MOCK_CATALOG.default ?? [])];
    }

    // Dedupe and add unique IDs based on query
    const seen = new Set<string>();
    return results.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    }).map((m, i) => ({
      ...m,
      id: `${m.id}-${Date.now()}-${i}`,
    }));
  }
}

// ─── Export singleton (swap provider here for real LLM) ───
let provider: MealSearchProvider = new MockLLMProvider();

export function setMealSearchProvider(p: MealSearchProvider): void {
  provider = p;
}

export async function searchMeals(query: string, mealType?: string): Promise<MealCard[]> {
  return provider.search(query, mealType);
}
