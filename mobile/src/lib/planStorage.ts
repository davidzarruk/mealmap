import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeekMealsMap } from '../data/plan';

const WEEK_PLAN_KEY = 'mealmap/latest-week-plan';

export async function loadWeekPlan(): Promise<WeekMealsMap | null> {
  const raw = await AsyncStorage.getItem(WEEK_PLAN_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as WeekMealsMap;
  } catch {
    return null;
  }
}

export async function saveWeekPlan(plan: WeekMealsMap): Promise<void> {
  await AsyncStorage.setItem(WEEK_PLAN_KEY, JSON.stringify(plan));
}
