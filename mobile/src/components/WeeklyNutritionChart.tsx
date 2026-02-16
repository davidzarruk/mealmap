/**
 * F9-002: Weekly Nutritional Summary
 *
 * Visual bar chart of daily macros (calories, protein, carbs, fat) for the week.
 */

import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DayKey, dayTabs, WeekMealsMap } from '../data/plan';
import { estimateDailyNutrition, DailyNutritionSummary } from '../lib/nutritionEstimation';
import { useThemeColors } from '../theme/colors';

type Props = {
  weekMeals: WeekMealsMap;
  servings?: number;
};

const MACRO_COLORS = {
  calories: '#4F46E5',
  protein: '#16A34A',
  carbs: '#E6A817',
  fat: '#DC2626',
};

export function WeeklyNutritionChart({ weekMeals, servings = 2 }: Props) {
  const theme = useThemeColors();

  const dailyData = useMemo(() => {
    const data: Record<DayKey, DailyNutritionSummary> = {} as any;
    for (const day of dayTabs) {
      data[day] = estimateDailyNutrition(weekMeals[day], servings);
    }
    return data;
  }, [weekMeals, servings]);

  const maxCalories = useMemo(
    () => Math.max(1, ...dayTabs.map((d) => dailyData[d].calories)),
    [dailyData],
  );

  const weeklyTotals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    for (const day of dayTabs) {
      const d = dailyData[day];
      calories += d.calories;
      protein += d.protein;
      carbs += d.carbs;
      fat += d.fat;
    }
    return { calories: Math.round(calories), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
  }, [dailyData]);

  const avgCalories = Math.round(weeklyTotals.calories / 7);

  return (
    <View style={[styles.container, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text }]}>Weekly Nutrition</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Avg {avgCalories} kcal/day · {weeklyTotals.calories} kcal total
      </Text>

      {/* Bar chart */}
      <View style={styles.chartRow}>
        {dayTabs.map((day) => {
          const d = dailyData[day];
          const heightPct = maxCalories > 0 ? (d.calories / maxCalories) * 100 : 0;
          return (
            <View key={day} style={styles.barCol}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(heightPct, 2)}%`,
                      backgroundColor: MACRO_COLORS.calories,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: theme.muted }]}>{day}</Text>
              <Text style={[styles.barValue, { color: theme.text }]}>{d.calories}</Text>
            </View>
          );
        })}
      </View>

      {/* Macro totals */}
      <View style={styles.macroRow}>
        <View style={styles.macroItem}>
          <View style={[styles.macroDot, { backgroundColor: MACRO_COLORS.protein }]} />
          <Text style={[styles.macroText, { color: theme.text }]}>Protein: {weeklyTotals.protein}g</Text>
        </View>
        <View style={styles.macroItem}>
          <View style={[styles.macroDot, { backgroundColor: MACRO_COLORS.carbs }]} />
          <Text style={[styles.macroText, { color: theme.text }]}>Carbs: {weeklyTotals.carbs}g</Text>
        </View>
        <View style={styles.macroItem}>
          <View style={[styles.macroDot, { backgroundColor: MACRO_COLORS.fat }]} />
          <Text style={[styles.macroText, { color: theme.text }]}>Fat: {weeklyTotals.fat}g</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  title: { fontWeight: '700', fontSize: 16 },
  subtitle: { fontSize: 12 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4, height: 120 },
  barCol: { flex: 1, alignItems: 'center', gap: 2 },
  barContainer: { flex: 1, width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '60%', borderRadius: 4, minHeight: 2 },
  barLabel: { fontSize: 10, fontWeight: '600' },
  barValue: { fontSize: 9, fontWeight: '500' },
  macroRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 6, borderTopWidth: 1, borderTopColor: '#E2E8F022' },
  macroItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  macroDot: { width: 8, height: 8, borderRadius: 4 },
  macroText: { fontSize: 11, fontWeight: '600' },
});
