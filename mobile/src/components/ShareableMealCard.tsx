/**
 * F9-007: Social Sharing — Shareable Meal Card
 *
 * A formatted view designed to be captured as an image for sharing.
 * Uses react-native-view-shot (or fallback to text-based sharing).
 */

import { forwardRef } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { IngredientItem, SkillLevel } from '../data/plan';
import { estimateMealNutrition } from '../lib/nutritionEstimation';

type Props = {
  title: string;
  prepTimeMin: number;
  level: SkillLevel;
  ingredients: IngredientItem[];
  servings?: number;
};

/**
 * Capturable meal card view.
 * Wrap with react-native-view-shot's `captureRef` for image sharing.
 * Falls back to text sharing when view-shot is unavailable.
 */
export const ShareableMealCard = forwardRef<View, Props>(
  ({ title, prepTimeMin, level, ingredients, servings = 2 }, ref) => {
    const nutrition = estimateMealNutrition(ingredients, servings);

    return (
      <View ref={ref} style={styles.container} collapsable={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🍽️ Mealmap</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaChip}>⏱ {prepTimeMin} min</Text>
          <Text style={styles.metaChip}>👤 {servings} servings</Text>
          <Text style={styles.metaChip}>📊 {level}</Text>
        </View>

        {/* Nutrition */}
        <View style={styles.nutritionRow}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{nutrition.perServing.calories}</Text>
            <Text style={styles.nutritionLabel}>kcal</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: '#16A34A' }]}>{nutrition.perServing.protein}g</Text>
            <Text style={styles.nutritionLabel}>protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: '#E6A817' }]}>{nutrition.perServing.carbs}g</Text>
            <Text style={styles.nutritionLabel}>carbs</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: '#DC2626' }]}>{nutrition.perServing.fat}g</Text>
            <Text style={styles.nutritionLabel}>fat</Text>
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.ingredientsSection}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {ingredients.map((ing) => (
            <Text key={`${ing.name}-${ing.unit}`} style={styles.ingredientText}>
              • {ing.name} — {ing.amount} {ing.unit}
            </Text>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Made with Mealmap 🍽️</Text>
      </View>
    );
  },
);

ShareableMealCard.displayName = 'ShareableMealCard';

/**
 * Fallback: share meal as formatted text (when image capture unavailable).
 */
export async function shareMealAsText(props: Props): Promise<void> {
  const nutrition = estimateMealNutrition(props.ingredients, props.servings ?? 2);
  const lines = [
    `🍽️ ${props.title}`,
    `⏱ ${props.prepTimeMin} min · 📊 ${props.level} · 👤 ${props.servings ?? 2} servings`,
    '',
    `🔥 ${nutrition.perServing.calories} kcal | 💪 ${nutrition.perServing.protein}g protein | 🌾 ${nutrition.perServing.carbs}g carbs | 🧈 ${nutrition.perServing.fat}g fat`,
    '',
    '📝 Ingredients:',
    ...props.ingredients.map((i) => `  • ${i.name} — ${i.amount} ${i.unit}`),
    '',
    'Made with Mealmap 🍽️',
  ];

  try {
    await Share.share({ message: lines.join('\n') });
  } catch {
    // user cancelled
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: { flexDirection: 'row', justifyContent: 'center' },
  logo: { fontSize: 14, fontWeight: '600', color: '#4F46E5' },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  metaRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  metaChip: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  nutritionRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#F8FAFC', borderRadius: 12, paddingVertical: 12 },
  nutritionItem: { alignItems: 'center', gap: 2 },
  nutritionValue: { fontSize: 18, fontWeight: '800', color: '#4F46E5' },
  nutritionLabel: { fontSize: 10, color: '#64748B' },
  ingredientsSection: { gap: 4 },
  sectionTitle: { fontWeight: '700', fontSize: 14, color: '#0F172A', marginBottom: 4 },
  ingredientText: { fontSize: 12, color: '#334155' },
  footer: { fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 4 },
});
