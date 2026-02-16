/**
 * F8-001: Abstract LLM meal generation service
 *
 * Provides an interface for AI-powered meal generation (OpenAI/Claude),
 * with a mock implementation used by default. The user can provide their
 * own API key later to enable real LLM generation.
 */

import { DayKey, dayTabs, IngredientItem, MealCard, WeekMealsMap, initialWeekMeals, replacementPool } from '../data/plan';

// ─── Types ───

export type MealGenerationPreferences = {
  peopleCount: number;
  mealTypes: string[];
  cookingLevel: string;
  maxTimeMinutes: number;
  region: string;
  dietaryTags: string[];
  dislikedMealIds?: string[];
  favoriteMealIds?: string[];
};

export type MealGenerationResult = {
  weekMeals: WeekMealsMap;
  source: 'mock' | 'openai' | 'claude';
};

export type LLMProvider = 'mock' | 'openai' | 'claude';

export interface MealGenerationProvider {
  readonly provider: LLMProvider;
  generateWeekPlan(prefs: MealGenerationPreferences): Promise<MealGenerationResult>;
  generateReplacementMeal(prefs: MealGenerationPreferences, day: DayKey, currentMeal: MealCard): Promise<MealCard>;
}

// ─── Mock provider (default) ───

class MockMealGenerationProvider implements MealGenerationProvider {
  readonly provider: LLMProvider = 'mock';

  async generateWeekPlan(prefs: MealGenerationPreferences): Promise<MealGenerationResult> {
    // Simulate LLM delay
    await new Promise((r) => setTimeout(r, 300));

    // Filter meals by dietary tags if provided
    const filtered: WeekMealsMap = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };

    for (const day of dayTabs) {
      const candidates = [...initialWeekMeals[day]];
      // Simple dietary filtering
      const matching = prefs.dietaryTags.length > 0
        ? candidates.filter((meal) => this.matchesDietary(meal, prefs.dietaryTags))
        : candidates;
      filtered[day] = matching.length > 0 ? matching : candidates.slice(0, 1);
    }

    return { weekMeals: filtered, source: 'mock' };
  }

  async generateReplacementMeal(prefs: MealGenerationPreferences, day: DayKey, _currentMeal: MealCard): Promise<MealCard> {
    await new Promise((r) => setTimeout(r, 200));

    const pool = replacementPool[day] ?? [];
    if (pool.length === 0) {
      // Fallback: return a random meal from another day
      const otherDays = dayTabs.filter((d) => d !== day);
      const randomDay = otherDays[Math.floor(Math.random() * otherDays.length)];
      const otherPool = replacementPool[randomDay] ?? initialWeekMeals[randomDay];
      return otherPool[Math.floor(Math.random() * otherPool.length)];
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  private matchesDietary(meal: MealCard, tags: string[]): boolean {
    const combined = `${meal.title} ${meal.ingredients.map((i) => i.name).join(' ')}`.toLowerCase();
    return tags.every((tag) => {
      switch (tag) {
        case 'vegetarian':
        case 'vegan':
          return !['chicken', 'beef', 'pork', 'turkey', 'tuna', 'tilapia', 'seafood', 'meat', 'steak'].some((w) => combined.includes(w));
        case 'gluten-free':
          return !['pasta', 'bread', 'tortilla', 'flour', 'bun', 'wrap'].some((w) => combined.includes(w));
        case 'dairy-free':
          return !['cheese', 'milk', 'cream', 'yogurt'].some((w) => combined.includes(w));
        default:
          return true;
      }
    });
  }
}

// ─── OpenAI provider (stub — requires API key) ───

export class OpenAIMealGenerationProvider implements MealGenerationProvider {
  readonly provider: LLMProvider = 'openai';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateWeekPlan(prefs: MealGenerationPreferences): Promise<MealGenerationResult> {
    const prompt = buildWeekPlanPrompt(prefs);
    const response = await this.callAPI(prompt);
    const weekMeals = parseWeekPlanResponse(response);
    return { weekMeals, source: 'openai' };
  }

  async generateReplacementMeal(prefs: MealGenerationPreferences, day: DayKey, currentMeal: MealCard): Promise<MealCard> {
    const prompt = buildReplacementPrompt(prefs, day, currentMeal);
    const response = await this.callAPI(prompt);
    return parseReplacementResponse(response, day);
  }

  private async callAPI(prompt: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error: ${res.status} ${err}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }
}

// ─── Claude provider (stub — requires API key) ───

export class ClaudeMealGenerationProvider implements MealGenerationProvider {
  readonly provider: LLMProvider = 'claude';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'claude-sonnet-4-20250514') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateWeekPlan(prefs: MealGenerationPreferences): Promise<MealGenerationResult> {
    const prompt = buildWeekPlanPrompt(prefs);
    const response = await this.callAPI(prompt);
    const weekMeals = parseWeekPlanResponse(response);
    return { weekMeals, source: 'claude' };
  }

  async generateReplacementMeal(prefs: MealGenerationPreferences, day: DayKey, currentMeal: MealCard): Promise<MealCard> {
    const prompt = buildReplacementPrompt(prefs, day, currentMeal);
    const response = await this.callAPI(prompt);
    return parseReplacementResponse(response, day);
  }

  private async callAPI(prompt: string): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Claude API error: ${res.status} ${err}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text ?? '';
  }
}

// ─── Shared prompts and parsers ───

const SYSTEM_PROMPT = `You are a meal planning assistant for Mealmap, a Colombian-focused meal planning app.
Generate meals as JSON. Each meal has: id (string), title (string), prepTimeMin (number), level ("Beginner"|"Intermediate"|"Advanced"),
ingredients (array of {name, amount, unit, category} where category is "Produce"|"Protein"|"Pantry"|"Dairy"),
and shortPrep (string, 1-2 sentences).
Respond ONLY with valid JSON, no markdown fences.`;

function buildWeekPlanPrompt(prefs: MealGenerationPreferences): string {
  return `Generate a weekly meal plan (Mon-Sun) for ${prefs.peopleCount} people in ${prefs.region}.
Cooking level: ${prefs.cookingLevel}. Max prep time: ${prefs.maxTimeMinutes} minutes.
Meal types: ${prefs.mealTypes.join(', ')}.
Dietary preferences: ${prefs.dietaryTags.length > 0 ? prefs.dietaryTags.join(', ') : 'none'}.
${prefs.dislikedMealIds?.length ? `Avoid meals similar to IDs: ${prefs.dislikedMealIds.join(', ')}` : ''}
${prefs.favoriteMealIds?.length ? `Include meals similar to favorites: ${prefs.favoriteMealIds.join(', ')}` : ''}

Return JSON: { "Mon": [meal, meal, meal], "Tue": [...], ... "Sun": [...] }
Each day should have 3 meal options. Use unique IDs like "gen-mon-1", "gen-tue-2", etc.`;
}

function buildReplacementPrompt(prefs: MealGenerationPreferences, day: DayKey, currentMeal: MealCard): string {
  return `Generate 1 replacement meal for ${day}, replacing "${currentMeal.title}".
Keep similar style but different protein/base. For ${prefs.peopleCount} people in ${prefs.region}.
Cooking level: ${prefs.cookingLevel}. Max prep time: ${prefs.maxTimeMinutes} min.
Dietary: ${prefs.dietaryTags.length > 0 ? prefs.dietaryTags.join(', ') : 'none'}.

Return JSON: a single meal object with id "gen-${day.toLowerCase()}-r${Date.now()}".`;
}

function parseWeekPlanResponse(response: string): WeekMealsMap {
  try {
    const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned) as Record<string, unknown[]>;
    const result: WeekMealsMap = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };

    for (const day of dayTabs) {
      const meals = parsed[day];
      if (Array.isArray(meals)) {
        result[day] = meals.map((m: any) => ({
          id: String(m.id ?? `gen-${day.toLowerCase()}-${Math.random().toString(36).slice(2, 6)}`),
          title: String(m.title ?? 'Untitled meal'),
          prepTimeMin: Number(m.prepTimeMin ?? 30),
          level: (['Beginner', 'Intermediate', 'Advanced'].includes(m.level) ? m.level : 'Beginner') as MealCard['level'],
          ingredients: Array.isArray(m.ingredients)
            ? m.ingredients.map((i: any) => ({
                name: String(i.name ?? ''),
                amount: Number(i.amount ?? 1),
                unit: String(i.unit ?? 'unit'),
                category: (['Produce', 'Protein', 'Pantry', 'Dairy'].includes(i.category) ? i.category : 'Pantry') as IngredientItem['category'],
              }))
            : [],
          shortPrep: String(m.shortPrep ?? ''),
        }));
      }
    }

    return result;
  } catch {
    // If parsing fails, return initial meals as fallback
    return initialWeekMeals;
  }
}

function parseReplacementResponse(response: string, day: DayKey): MealCard {
  try {
    const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const m = JSON.parse(cleaned) as any;
    return {
      id: String(m.id ?? `gen-${day.toLowerCase()}-r${Date.now()}`),
      title: String(m.title ?? 'Replacement meal'),
      prepTimeMin: Number(m.prepTimeMin ?? 30),
      level: (['Beginner', 'Intermediate', 'Advanced'].includes(m.level) ? m.level : 'Beginner') as MealCard['level'],
      ingredients: Array.isArray(m.ingredients)
        ? m.ingredients.map((i: any) => ({
            name: String(i.name ?? ''),
            amount: Number(i.amount ?? 1),
            unit: String(i.unit ?? 'unit'),
            category: (['Produce', 'Protein', 'Pantry', 'Dairy'].includes(i.category) ? i.category : 'Pantry') as IngredientItem['category'],
          }))
        : [],
      shortPrep: String(m.shortPrep ?? ''),
    };
  } catch {
    // Fallback to replacement pool
    const pool = replacementPool[day] ?? [];
    return pool[0] ?? initialWeekMeals[day][0];
  }
}

// ─── Service singleton ───

let _activeProvider: MealGenerationProvider = new MockMealGenerationProvider();

export function getMealGenerationProvider(): MealGenerationProvider {
  return _activeProvider;
}

export function setMealGenerationProvider(provider: MealGenerationProvider): void {
  _activeProvider = provider;
}

/**
 * Convenience: configure provider from stored settings.
 * Call this at app startup if the user has saved an API key.
 */
export function configureMealGeneration(config: {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
}): void {
  switch (config.provider) {
    case 'openai':
      if (!config.apiKey) throw new Error('OpenAI API key required');
      _activeProvider = new OpenAIMealGenerationProvider(config.apiKey, config.model);
      break;
    case 'claude':
      if (!config.apiKey) throw new Error('Claude API key required');
      _activeProvider = new ClaudeMealGenerationProvider(config.apiKey, config.model);
      break;
    default:
      _activeProvider = new MockMealGenerationProvider();
  }
}

// Re-export for convenience
export { MockMealGenerationProvider };
