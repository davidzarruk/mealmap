/**
 * F9-006: Meal Calendar View
 *
 * Monthly calendar showing what meals are planned/eaten per day.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { dayTabs, DayKey, initialWeekMeals, WeekMealsMap } from '../../data/plan';
import { loadWeekPlan } from '../../lib/planStorage';
import { useThemeColors } from '../../theme/colors';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function MealCalendarScreen() {
  const theme = useThemeColors();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [weekMeals, setWeekMeals] = useState<WeekMealsMap>(initialWeekMeals);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    loadWeekPlan().then((stored) => { if (stored) setWeekMeals(stored); }).catch(() => undefined);
  }, []);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);

  // Map current week's meals to calendar days (simplified: map Mon-Sun to this week's dates)
  const mealsByDate = useMemo(() => {
    const map: Record<number, string[]> = {};
    // Find the Monday of the current week
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    dayTabs.forEach((day, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + mondayOffset + i);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        map[date.getDate()] = weekMeals[day].map((m) => m.title);
      }
    });
    return map;
  }, [weekMeals, currentMonth, currentYear]);

  const prevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  }, [currentMonth]);

  const nextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  }, [currentMonth]);

  const calendarCells: Array<number | null> = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const selectedMeals = selectedDay != null ? mealsByDate[selectedDay] : null;

  return (
    <ScreenContainer title="Meal Calendar" subtitle={`${MONTH_NAMES[currentMonth]} ${currentYear}`}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.navRow}>
          <Pressable onPress={prevMonth} style={[styles.navButton, { borderColor: theme.border }]}>
            <Text style={[styles.navText, { color: theme.text }]}>◀</Text>
          </Pressable>
          <Text style={[styles.monthTitle, { color: theme.text }]}>{MONTH_NAMES[currentMonth]} {currentYear}</Text>
          <Pressable onPress={nextMonth} style={[styles.navButton, { borderColor: theme.border }]}>
            <Text style={[styles.navText, { color: theme.text }]}>▶</Text>
          </Pressable>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label) => (
            <View key={label} style={styles.weekdayCell}>
              <Text style={[styles.weekdayText, { color: theme.muted }]}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {calendarCells.map((day, i) => {
            const hasMeals = day != null && mealsByDate[day] != null;
            const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
            const isSelected = day === selectedDay;
            return (
              <Pressable
                key={i}
                onPress={() => day != null && setSelectedDay(day)}
                style={[
                  styles.dayCell,
                  { borderColor: theme.border },
                  isToday && { borderColor: theme.primary, borderWidth: 2 },
                  isSelected && { backgroundColor: theme.primary + '15' },
                ]}
              >
                {day != null ? (
                  <>
                    <Text style={[styles.dayNumber, { color: theme.text }, isToday && { color: theme.primary, fontWeight: '800' }]}>{day}</Text>
                    {hasMeals ? (
                      <View style={[styles.mealDot, { backgroundColor: theme.success }]} />
                    ) : null}
                  </>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {selectedDay != null && selectedMeals ? (
          <View style={[styles.detailCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Text style={[styles.detailTitle, { color: theme.text }]}>
              {MONTH_NAMES[currentMonth]} {selectedDay}
            </Text>
            {selectedMeals.map((title, i) => (
              <View key={i} style={styles.detailRow}>
                <Text style={[styles.detailBullet, { color: theme.primary }]}>•</Text>
                <Text style={[styles.detailText, { color: theme.text }]}>{title}</Text>
              </View>
            ))}
          </View>
        ) : selectedDay != null ? (
          <View style={[styles.detailCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Text style={[styles.detailTitle, { color: theme.muted }]}>No meals planned for this day</Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, paddingBottom: 24 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navButton: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  navText: { fontSize: 16, fontWeight: '600' },
  monthTitle: { fontSize: 18, fontWeight: '700' },
  weekdayRow: { flexDirection: 'row' },
  weekdayCell: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  weekdayText: { fontSize: 11, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dayNumber: { fontSize: 14, fontWeight: '500' },
  mealDot: { width: 6, height: 6, borderRadius: 3 },
  detailCard: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  detailTitle: { fontWeight: '700', fontSize: 15, marginBottom: 4 },
  detailRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  detailBullet: { fontSize: 16 },
  detailText: { fontSize: 14 },
});
