import { useMemo, useState } from 'react';
import { trackEvent } from '../../lib/analytics';
import { Keyboard, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ColorScheme, useThemeColors } from '../../theme/colors';

type CookingLevel = 'beginner' | 'intermediate' | 'advanced';
type Region = 'colombia' | 'international';

export function SetupScreen() {
  const theme = useThemeColors();
  const [people, setPeople] = useState('2');
  const [includeBreakfast, setIncludeBreakfast] = useState(false);
  const [includeLunch, setIncludeLunch] = useState(true);
  const [includeDinner, setIncludeDinner] = useState(false);
  const [maxPrepMinutes, setMaxPrepMinutes] = useState('45');
  const [cookingLevel, setCookingLevel] = useState<CookingLevel>('beginner');
  const [region, setRegion] = useState<Region>('colombia');

  const selectedMealsCount = [includeBreakfast, includeLunch, includeDinner].filter(Boolean).length;

  const summary = useMemo(() => {
    const meals = [includeBreakfast ? 'Breakfast' : null, includeLunch ? 'Lunch' : null, includeDinner ? 'Dinner' : null].filter(Boolean);
    return `${people || '-'} people · ${meals.join(', ') || 'No meals selected'} · ${maxPrepMinutes || '-'} min max`;
  }, [includeBreakfast, includeDinner, includeLunch, maxPrepMinutes, people]);

  const onSavePreferences = () => {
    trackEvent('plan_created', { people: Number(people || 0), includeBreakfast, includeLunch, includeDinner, maxPrepMinutes: Number(maxPrepMinutes || 0), cookingLevel, region }).catch(() => undefined);
  };

  return (
    <ScreenContainer title="Plan preferences" subtitle="Tell us who you're cooking for and your weekly constraints.">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Text style={[styles.label, { color: theme.text }]}>How many people?</Text>
            <TextInput value={people} onChangeText={setPeople} keyboardType="number-pad" style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]} placeholder="2" placeholderTextColor={theme.muted} />

            <Text style={[styles.label, { color: theme.text }]}>Meal types</Text>
            <RowToggle label="Breakfast" value={includeBreakfast} onValueChange={setIncludeBreakfast} theme={theme} />
            <RowToggle label="Lunch" value={includeLunch} onValueChange={setIncludeLunch} theme={theme} />
            <RowToggle label="Dinner" value={includeDinner} onValueChange={setIncludeDinner} theme={theme} />

            {selectedMealsCount === 0 ? <Text style={[styles.warning, { color: theme.danger }]}>Select at least one meal type to generate a plan.</Text> : null}

            <Text style={[styles.label, { color: theme.text }]}>Cooking level</Text>
            <View style={styles.segmentedRow}>
              {(['beginner', 'intermediate', 'advanced'] as CookingLevel[]).map((level) => (
                <SegmentButton key={level} label={level} selected={cookingLevel === level} onPress={() => setCookingLevel(level)} theme={theme} />
              ))}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Max prep time (minutes)</Text>
            <TextInput value={maxPrepMinutes} onChangeText={setMaxPrepMinutes} keyboardType="number-pad" style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]} placeholder="45" placeholderTextColor={theme.muted} />

            <Text style={[styles.label, { color: theme.text }]}>Region preference</Text>
            <View style={styles.segmentedRow}>
              <SegmentButton label="Colombia" selected={region === 'colombia'} onPress={() => setRegion('colombia')} theme={theme} />
              <SegmentButton label="International" selected={region === 'international'} onPress={() => setRegion('international')} theme={theme} />
            </View>
          </View>

          <View style={[styles.summaryCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Text style={[styles.summaryTitle, { color: theme.text }]}>Current setup</Text>
            <Text style={[styles.summaryText, { color: theme.muted }]}>{summary}</Text>
          </View>

          <Pressable style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={onSavePreferences}>
            <Text style={styles.primaryButtonText}>Save preferences</Text>
          </Pressable>
        </ScrollView>
      </TouchableWithoutFeedback>
    </ScreenContainer>
  );
}

type RowToggleProps = { label: string; value: boolean; onValueChange: (next: boolean) => void; theme: ColorScheme };

function RowToggle({ label, value, onValueChange, theme }: RowToggleProps) {
  return (
    <View style={styles.toggleRow}>
      <Text style={[styles.toggleLabel, { color: theme.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

type SegmentButtonProps = { label: string; selected: boolean; onPress: () => void; theme: ColorScheme };

function SegmentButton({ label, selected, onPress, theme }: SegmentButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.segmentButton, { borderColor: theme.border, backgroundColor: theme.surface }, selected && { borderColor: theme.primary, backgroundColor: theme.primary + '18' }]}>
      <Text style={[styles.segmentButtonText, { color: theme.text }, selected && { color: theme.primary, fontWeight: '600' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, paddingBottom: 24 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 10 },
  label: { fontWeight: '600', marginTop: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  warning: { fontSize: 12 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabel: {},
  segmentedRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  segmentButton: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  segmentButtonText: { textTransform: 'capitalize' },
  summaryCard: { borderWidth: 1, borderRadius: 12, padding: 12 },
  summaryTitle: { fontWeight: '600', marginBottom: 4 },
  summaryText: {},
  primaryButton: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
});
