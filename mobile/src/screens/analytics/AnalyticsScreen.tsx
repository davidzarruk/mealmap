import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AnalyticsEvent, getAnalyticsEvents, getAnalyticsSummary } from '../../lib/analytics';
import { useThemeColors } from '../../theme/colors';

type Summary = { plan_created: number; meal_swapped: number; list_generated: number };
const EMPTY_SUMMARY: Summary = { plan_created: 0, meal_swapped: 0, list_generated: 0 };

export function AnalyticsScreen() {
  const theme = useThemeColors();
  const [summary, setSummary] = useState<Summary>(EMPTY_SUMMARY);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  const load = useCallback(async () => {
    const [s, e] = await Promise.all([getAnalyticsSummary(), getAnalyticsEvents(10)]);
    setSummary(s as Summary);
    setEvents(e);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <ScreenContainer title="Insights" subtitle="Basic usage analytics from local events.">
      <View style={styles.cardsRow}>
        <MetricCard label="Plans" value={summary.plan_created} theme={theme} />
        <MetricCard label="Swaps" value={summary.meal_swapped} theme={theme} />
        <MetricCard label="Lists" value={summary.list_generated} theme={theme} />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent events</Text>
      {events.length === 0 ? <Text style={[styles.empty, { color: theme.muted }]}>No analytics events yet.</Text> : null}
      {events.map((event, idx) => (
        <View key={`${event.at}-${idx}`} style={[styles.eventRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.eventName, { color: theme.text }]}>{event.name}</Text>
          <Text style={[styles.eventAt, { color: theme.muted }]}>{new Date(event.at).toLocaleString()}</Text>
        </View>
      ))}

      <Pressable style={[styles.refreshButton, { borderColor: theme.primary }]} onPress={() => void load()}>
        <Text style={[styles.refreshText, { color: theme.primary }]}>Refresh</Text>
      </Pressable>
    </ScreenContainer>
  );
}

function MetricCard({ label, value, theme }: { label: string; value: number; theme: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={[styles.metricCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      <Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  metricCard: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  metricValue: { fontSize: 20, fontWeight: '700' },
  metricLabel: { fontSize: 12 },
  sectionTitle: { marginTop: 8, marginBottom: 8, fontWeight: '700' },
  empty: { marginBottom: 8 },
  eventRow: { borderBottomWidth: 1, paddingVertical: 8 },
  eventName: { fontWeight: '600' },
  eventAt: { fontSize: 12 },
  refreshButton: { marginTop: 14, borderWidth: 1, borderRadius: 10, alignItems: 'center', paddingVertical: 10 },
  refreshText: { fontWeight: '600' },
});
