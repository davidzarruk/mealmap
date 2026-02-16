import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { getPlanHistory, loadWeekPlanFromSupabase } from '../../lib/supabasePlanService';
import { useThemeColors } from '../../theme/colors';

type PlanSummary = {
  id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  people_count: number;
  meal_types: string[];
  cooking_level: string;
  region: string;
};

export function PlanHistoryScreen() {
  const theme = useThemeColors();
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [expandedMeals, setExpandedMeals] = useState<string[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getPlanHistory(20);
      setPlans(data as PlanSummary[]);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadHistory().finally(() => setLoading(false));
  }, [loadHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const toggleExpand = async (planId: string) => {
    if (expandedPlanId === planId) {
      setExpandedPlanId(null);
      setExpandedMeals([]);
      return;
    }
    setExpandedPlanId(planId);
    try {
      const data = await loadWeekPlanFromSupabase(planId);
      if (data) {
        const allMealTitles = Object.entries(data.weekMeals).flatMap(([day, meals]) =>
          meals.map((m) => `${day}: ${m.title}`),
        );
        setExpandedMeals(allMealTitles);
      } else {
        setExpandedMeals(['No meals found']);
      }
    } catch {
      setExpandedMeals(['Could not load meals']);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <ScreenContainer
      title="Plan history"
      subtitle="Your past weekly plans."
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
    >
      {loading ? (
        <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.loadingText, { color: theme.muted }]}>Loading history…</Text>
        </View>
      ) : plans.length === 0 ? (
        <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No completed plans yet</Text>
          <Text style={[styles.emptyText, { color: theme.muted }]}>Complete your first weekly plan to see it here.</Text>
        </View>
      ) : (
        plans.map((plan) => (
          <Pressable key={plan.id} onPress={() => toggleExpand(plan.id)} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Week of {formatDate(plan.created_at)}
              </Text>
              <Text style={[styles.statusBadge, { color: theme.success, borderColor: theme.success + '40' }]}>
                ✓ Completed
              </Text>
            </View>
            <Text style={[styles.cardMeta, { color: theme.muted }]}>
              {plan.people_count} people · {plan.cooking_level} · {plan.meal_types.join(', ')}
            </Text>
            {plan.completed_at ? (
              <Text style={[styles.completedAt, { color: theme.muted }]}>
                Completed: {formatDate(plan.completed_at)}
              </Text>
            ) : null}
            {expandedPlanId === plan.id ? (
              <View style={styles.expandedSection}>
                {expandedMeals.map((meal, i) => (
                  <Text key={i} style={[styles.mealItem, { color: theme.text }]}>• {meal}</Text>
                ))}
              </View>
            ) : (
              <Text style={[styles.tapHint, { color: theme.primary }]}>Tap to see meals</Text>
            )}
          </Pressable>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontWeight: '700', fontSize: 15 },
  statusBadge: { fontSize: 12, fontWeight: '700', borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  cardMeta: { fontSize: 12, marginTop: 4 },
  completedAt: { fontSize: 12, marginTop: 2 },
  tapHint: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  expandedSection: { marginTop: 8, gap: 2 },
  mealItem: { fontSize: 13 },
  loadingText: { textAlign: 'center' },
  emptyTitle: { fontWeight: '700' },
  emptyText: { marginTop: 4 },
});
