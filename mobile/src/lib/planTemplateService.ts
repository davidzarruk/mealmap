/**
 * F10-004: Plan Template Service
 *
 * Save/load/apply weekly plan templates via Supabase.
 */

import { supabase } from './supabase';
import { WeekMealsMap } from '../data/plan';

// ─── Types ───

export type PlanTemplate = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  meals_json: WeekMealsMap;
  people_count: number;
  cooking_level: string;
  region: string;
  is_public: boolean;
  used_count: number;
  created_at: string;
  updated_at: string;
};

// ─── CRUD ───

export async function getMyTemplates(): Promise<PlanTemplate[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('plan_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (data ?? []) as PlanTemplate[];
}

export async function getPublicTemplates(limit = 20): Promise<PlanTemplate[]> {
  const { data } = await supabase
    .from('plan_templates')
    .select('*')
    .eq('is_public', true)
    .order('used_count', { ascending: false })
    .limit(limit);

  return (data ?? []) as PlanTemplate[];
}

export async function saveAsTemplate(params: {
  name: string;
  description?: string;
  meals: WeekMealsMap;
  peopleCount?: number;
  cookingLevel?: string;
  isPublic?: boolean;
}): Promise<PlanTemplate | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('plan_templates')
    .insert({
      user_id: user.id,
      name: params.name,
      description: params.description ?? null,
      meals_json: params.meals,
      people_count: params.peopleCount ?? 2,
      cooking_level: params.cookingLevel ?? 'easy',
      region: 'CO',
      is_public: params.isPublic ?? false,
    })
    .select('*')
    .single();

  if (error) return null;
  return data as PlanTemplate;
}

export async function deleteTemplate(templateId: string): Promise<void> {
  await supabase.from('plan_templates').delete().eq('id', templateId);
}

export async function incrementTemplateUsage(templateId: string): Promise<void> {
  const { data } = await supabase
    .from('plan_templates')
    .select('used_count')
    .eq('id', templateId)
    .single();

  if (data) {
    await supabase
      .from('plan_templates')
      .update({ used_count: (data.used_count as number) + 1 })
      .eq('id', templateId);
  }
}

/**
 * Apply a template to create a new plan. Returns the meals map.
 */
export async function applyTemplate(templateId: string): Promise<WeekMealsMap | null> {
  const { data } = await supabase
    .from('plan_templates')
    .select('meals_json')
    .eq('id', templateId)
    .single();

  if (!data) return null;

  await incrementTemplateUsage(templateId);
  return data.meals_json as WeekMealsMap;
}
