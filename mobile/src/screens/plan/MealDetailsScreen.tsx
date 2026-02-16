import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { estimateMealNutrition } from '../../lib/nutritionEstimation';
import { useThemeColors } from '../../theme/colors';
import { AppStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, 'MealDetails'>;

export function MealDetailsScreen({ route }: Props) {
  const { slotId, title, prepTimeMin, level, ingredients, shortPrep } = route.params;
  const theme = useThemeColors();
  const nutrition = useMemo(() => estimateMealNutrition(ingredients, 2), [ingredients]);

  // Parse steps from shortPrep (split by comma or period)
  const steps = shortPrep
    .split(/[.,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return (
    <ScreenContainer title={title} subtitle={`${slotId} · ${level}`}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Photo placeholder */}
        <View style={[styles.photoPlaceholder, { backgroundColor: theme.border }]}>
          <Text style={[styles.photoEmoji]}>🍽️</Text>
          <Text style={[styles.photoText, { color: theme.muted }]}>Photo coming soon</Text>
        </View>

        {/* Quick info bar */}
        <View style={[styles.infoBar, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoValue, { color: theme.text }]}>⏱ {prepTimeMin}</Text>
            <Text style={[styles.infoLabel, { color: theme.muted }]}>minutes</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          <View style={styles.infoItem}>
            <Text style={[styles.infoValue, { color: theme.text }]}>👤 2</Text>
            <Text style={[styles.infoLabel, { color: theme.muted }]}>servings</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          <View style={styles.infoItem}>
            <Text style={[styles.infoValue, { color: theme.text }]}>📊 {level}</Text>
            <Text style={[styles.infoLabel, { color: theme.muted }]}>difficulty</Text>
          </View>
        </View>

        {/* F9-001: Nutritional info */}
        <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <View style={styles.nutritionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Nutrition per serving</Text>
            <View style={[styles.confidenceBadge, { backgroundColor: nutrition.confidence === 'high' ? theme.success + '20' : nutrition.confidence === 'medium' ? theme.primary + '20' : theme.danger + '20' }]}>
              <Text style={[styles.confidenceText, { color: nutrition.confidence === 'high' ? theme.success : nutrition.confidence === 'medium' ? theme.primary : theme.danger }]}>
                {nutrition.confidence === 'high' ? '✓ High accuracy' : nutrition.confidence === 'medium' ? '~ Estimated' : '? Rough estimate'}
              </Text>
            </View>
          </View>
          <View style={styles.macroGrid}>
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: theme.primary }]}>{nutrition.perServing.calories}</Text>
              <Text style={[styles.macroLabel, { color: theme.muted }]}>kcal</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: theme.success }]}>{nutrition.perServing.protein}g</Text>
              <Text style={[styles.macroLabel, { color: theme.muted }]}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: '#E6A817' }]}>{nutrition.perServing.carbs}g</Text>
              <Text style={[styles.macroLabel, { color: theme.muted }]}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: theme.danger }]}>{nutrition.perServing.fat}g</Text>
              <Text style={[styles.macroLabel, { color: theme.muted }]}>Fat</Text>
            </View>
          </View>
          <Text style={[styles.macroNote, { color: theme.muted }]}>
            Fiber: {nutrition.perServing.fiber}g · Total for {nutrition.servings} servings: {nutrition.calories} kcal
          </Text>
        </View>

        {/* Ingredients */}
        <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Ingredients</Text>
          {ingredients.map((item) => (
            <View key={`${item.name}-${item.unit}`} style={styles.ingredientRow}>
              <View style={[styles.ingredientDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.ingredientName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.ingredientQty, { color: theme.muted }]}>
                {item.amount} {item.unit}
              </Text>
            </View>
          ))}
        </View>

        {/* Preparation steps */}
        <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Preparation</Text>
          {steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: theme.text }]}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, paddingBottom: 24 },
  photoPlaceholder: { height: 180, borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: 8 },
  photoEmoji: { fontSize: 48 },
  photoText: { fontSize: 13 },
  infoBar: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  infoItem: { flex: 1, alignItems: 'center' },
  infoValue: { fontWeight: '700', fontSize: 15 },
  infoLabel: { fontSize: 11, marginTop: 2 },
  infoDivider: { width: 1, height: 30 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 10 },
  sectionTitle: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ingredientDot: { width: 6, height: 6, borderRadius: 3 },
  ingredientName: { flex: 1 },
  ingredientQty: { fontWeight: '600' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNumber: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  stepText: { flex: 1, lineHeight: 20 },
  nutritionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  confidenceBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  confidenceText: { fontSize: 10, fontWeight: '600' },
  macroGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  macroItem: { alignItems: 'center', gap: 2 },
  macroValue: { fontSize: 20, fontWeight: '800' },
  macroLabel: { fontSize: 11 },
  macroNote: { fontSize: 11, textAlign: 'center', marginTop: 4 },
});
