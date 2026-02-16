/**
 * F8-007: Widget bridge (stub for Expo managed)
 *
 * This module provides the interface for communicating with the iOS WidgetKit
 * extension. In Expo managed workflow, these are no-ops. See docs/ios-widget-spec.md
 * for full implementation details after ejecting.
 */

import { Platform } from 'react-native';
import { WeekMealsMap, DayKey, dayTabs } from '../data/plan';

// ─── Types ───

export type WidgetMealItem = {
  title: string;
  time: string;
  approved: boolean;
  emoji: string;
  prepTimeMin: number;
};

export type WidgetData = {
  date: string;
  meals: WidgetMealItem[];
  progress: {
    approved: number;
    total: number;
    percent: number;
  };
};

// ─── Emoji lookup (reuse from MealCategoryIcon logic) ───

const MEAL_EMOJI: Record<string, string> = {
  chicken: '🍗', beef: '🥩', fish: '🐟', pasta: '🍝', rice: '🍚',
  soup: '🍲', salad: '🥗', egg: '🍳', vegetable: '🥬', wrap: '🌮',
};

function getMealEmoji(title: string): string {
  const lower = title.toLowerCase();
  for (const [key, emoji] of Object.entries(MEAL_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return '🍽️';
}

// ─── Build widget data from app state ───

export function buildWidgetData(
  weekMeals: WeekMealsMap,
  approvedIds: string[],
  today?: DayKey,
): WidgetData {
  const todayKey = today ?? getTodayKey();
  const todayMeals = weekMeals[todayKey] ?? [];
  const totalMeals = dayTabs.reduce((acc, d) => acc + weekMeals[d].length, 0);

  return {
    date: new Date().toISOString().slice(0, 10),
    meals: todayMeals.map((meal) => ({
      title: meal.title,
      time: '12:00',
      approved: approvedIds.includes(meal.id),
      emoji: getMealEmoji(meal.title),
      prepTimeMin: meal.prepTimeMin,
    })),
    progress: {
      approved: approvedIds.length,
      total: totalMeals,
      percent: totalMeals > 0 ? Math.round((approvedIds.length / totalMeals) * 100) : 0,
    },
  };
}

function getTodayKey(): DayKey {
  const days: DayKey[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date().getDay()];
}

// ─── Widget update (no-op in Expo managed) ───

/**
 * Update the iOS widget with current meal data.
 * This is a no-op in Expo managed workflow.
 * After ejecting, replace with actual NativeModule calls.
 */
export async function updateWidget(
  weekMeals: WeekMealsMap,
  approvedIds: string[],
): Promise<void> {
  if (Platform.OS !== 'ios') return;

  const data = buildWidgetData(weekMeals, approvedIds);

  // In Expo managed, this is a no-op.
  // After ejecting, uncomment:
  // const { SharedGroupPreferences } = NativeModules;
  // await SharedGroupPreferences.setItem('todayMeals', JSON.stringify(data), 'group.com.mealmap.app');
  // const { WidgetKitBridge } = NativeModules;
  // await WidgetKitBridge.reloadAllTimelines();

  // eslint-disable-next-line no-console
  if (__DEV__) console.log('[widget] data prepared (no-op in managed):', data.meals.length, 'meals');
}
