/**
 * F9-003: Meal Prep Mode Screen
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { generateMealPrepPlan } from '../../lib/mealPrepMode';
import { useThemeColors } from '../../theme/colors';
import { AppStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, 'MealPrep'>;

export function MealPrepScreen({ route }: Props) {
  const theme = useThemeColors();
  const { weekMealsJson, approvedIds } = route.params;
  const weekMeals = useMemo(() => JSON.parse(weekMealsJson), [weekMealsJson]);
  const plan = useMemo(() => generateMealPrepPlan(weekMeals, approvedIds), [weekMeals, approvedIds]);

  return (
    <ScreenContainer title="Meal Prep Mode" subtitle={`${plan.groups.length} groups · Save ~${plan.timeSaved} min`}>
      <ScrollView contentContainerStyle={styles.content}>
        {plan.groups.length === 0 ? (
          <View style={[styles.emptyCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No approved meals yet</Text>
            <Text style={[styles.emptyText, { color: theme.muted }]}>Approve some meals first to see prep groups.</Text>
          </View>
        ) : null}

        {plan.groups.map((group, i) => (
          <View key={i} style={[styles.groupCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <View style={styles.groupHeader}>
              <View style={[styles.orderBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.orderText}>{group.suggestedOrder}</Text>
              </View>
              <Text style={[styles.groupTitle, { color: theme.text }]}>
                Batch {group.suggestedOrder} · {group.meals.length} meals
              </Text>
              <Text style={[styles.groupTime, { color: theme.muted }]}>⏱ {group.totalPrepTime} min</Text>
            </View>

            {group.sharedIngredients.length > 0 ? (
              <View style={styles.sharedRow}>
                <Text style={[styles.sharedLabel, { color: theme.muted }]}>Shared:</Text>
                {group.sharedIngredients.map((ing) => (
                  <View key={ing} style={[styles.sharedChip, { backgroundColor: theme.primary + '15' }]}>
                    <Text style={[styles.sharedChipText, { color: theme.primary }]}>{ing}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {group.meals.map((m) => (
              <View key={m.meal.id} style={styles.mealRow}>
                <Text style={[styles.dayBadge, { color: theme.muted }]}>{m.day}</Text>
                <Text style={[styles.mealName, { color: theme.text }]}>{m.meal.title}</Text>
                <Text style={[styles.mealTime, { color: theme.muted }]}>{m.meal.prepTimeMin}m</Text>
              </View>
            ))}
          </View>
        ))}

        {plan.timeSaved > 0 ? (
          <View style={[styles.savingsCard, { backgroundColor: theme.success + '15', borderColor: theme.success + '40' }]}>
            <Text style={[styles.savingsText, { color: theme.success }]}>
              🕐 Estimated time saved by batch cooking: ~{plan.timeSaved} minutes
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, paddingBottom: 24 },
  emptyCard: { borderWidth: 1, borderRadius: 12, padding: 16 },
  emptyTitle: { fontWeight: '700', marginBottom: 4 },
  emptyText: {},
  groupCard: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderBadge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  orderText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  groupTitle: { flex: 1, fontWeight: '700', fontSize: 15 },
  groupTime: { fontSize: 12 },
  sharedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, alignItems: 'center' },
  sharedLabel: { fontSize: 11, fontWeight: '600' },
  sharedChip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  sharedChipText: { fontSize: 11, fontWeight: '600' },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 34 },
  dayBadge: { fontSize: 11, fontWeight: '600', width: 28 },
  mealName: { flex: 1, fontSize: 13 },
  mealTime: { fontSize: 11 },
  savingsCard: { borderWidth: 1, borderRadius: 12, padding: 12 },
  savingsText: { fontWeight: '600', fontSize: 13, textAlign: 'center' },
});
