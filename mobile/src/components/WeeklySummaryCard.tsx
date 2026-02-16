import { StyleSheet, Text, View } from 'react-native';
import { dayTabs, DayKey, WeekMealsMap } from '../data/plan';
import { useThemeColors } from '../theme/colors';

type WeeklySummaryCardProps = {
  weekMeals: WeekMealsMap;
  approvedIds: string[];
};

export function WeeklySummaryCard({ weekMeals, approvedIds }: WeeklySummaryCardProps) {
  const theme = useThemeColors();

  const approvedSet = new Set(approvedIds);
  const totalMeals = dayTabs.reduce((acc, day) => acc + weekMeals[day].length, 0);
  const totalApproved = approvedIds.length;
  const totalPending = totalMeals - totalApproved;
  const pct = totalMeals > 0 ? Math.round((totalApproved / totalMeals) * 100) : 0;

  const dayStats = dayTabs.map((day) => {
    const meals = weekMeals[day];
    const approved = meals.filter((m) => approvedSet.has(m.id)).length;
    return { day, total: meals.length, approved };
  });

  return (
    <View
      style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}
      accessibilityRole="summary"
      accessibilityLabel={`Weekly summary: ${totalApproved} approved, ${totalPending} pending, ${pct}% complete`}
    >
      <Text style={[styles.title, { color: theme.text }]}>📊 Weekly Summary</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.success }]}>{totalApproved}</Text>
          <Text style={[styles.statLabel, { color: theme.muted }]}>Approved</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.primary }]}>{totalPending}</Text>
          <Text style={[styles.statLabel, { color: theme.muted }]}>Pending</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.text }]}>{pct}%</Text>
          <Text style={[styles.statLabel, { color: theme.muted }]}>Complete</Text>
        </View>
      </View>

      <View style={styles.daysRow}>
        {dayStats.map(({ day, total, approved }) => {
          const done = total > 0 && approved === total;
          const partial = approved > 0 && approved < total;
          const bg = done ? theme.success + '20' : partial ? theme.primary + '18' : theme.border + '40';
          const dotColor = done ? theme.success : partial ? theme.primary : theme.muted;
          return (
            <View key={day} style={[styles.dayChip, { backgroundColor: bg }]}>
              <View style={[styles.dayDot, { backgroundColor: dotColor }]} />
              <Text style={[styles.dayLabel, { color: theme.text }]}>{day}</Text>
              <Text style={[styles.dayCount, { color: theme.muted }]}>
                {approved}/{total}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 12 },
  title: { fontWeight: '700', fontSize: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2 },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, gap: 4 },
  dayDot: { width: 6, height: 6, borderRadius: 3 },
  dayLabel: { fontSize: 12, fontWeight: '600' },
  dayCount: { fontSize: 10 },
});
