/**
 * F10-002: Custom Meal Creation
 *
 * Full form to create custom recipes: name, dynamic ingredients,
 * preparation steps, time, servings, category/difficulty.
 */

import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '../../components/ScreenContainer';
import { IngredientItem, MealCard, SkillLevel } from '../../data/plan';
import { useThemeColors } from '../../theme/colors';

const CUSTOM_MEALS_KEY = 'mealmap/custom-meals';

type IngredientDraft = {
  name: string;
  amount: string;
  unit: string;
  category: IngredientItem['category'];
};

const CATEGORIES: IngredientItem['category'][] = ['Produce', 'Protein', 'Pantry', 'Dairy'];
const SKILL_LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

export async function loadCustomMeals(): Promise<MealCard[]> {
  const raw = await AsyncStorage.getItem(CUSTOM_MEALS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MealCard[];
  } catch {
    return [];
  }
}

async function saveCustomMeal(meal: MealCard): Promise<void> {
  const existing = await loadCustomMeals();
  existing.push(meal);
  await AsyncStorage.setItem(CUSTOM_MEALS_KEY, JSON.stringify(existing));
}

export function CustomMealScreen() {
  const navigation = useNavigation();
  const theme = useThemeColors();

  const [name, setName] = useState('');
  const [prepTime, setPrepTime] = useState('30');
  const [servings, setServings] = useState('2');
  const [level, setLevel] = useState<SkillLevel>('Beginner');
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([
    { name: '', amount: '', unit: 'g', category: 'Produce' },
  ]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [saving, setSaving] = useState(false);

  const addIngredient = useCallback(() => {
    setIngredients((prev) => [...prev, { name: '', amount: '', unit: 'g', category: 'Produce' }]);
  }, []);

  const removeIngredient = useCallback((index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateIngredient = useCallback((index: number, field: keyof IngredientDraft, value: string) => {
    setIngredients((prev) => prev.map((ing, i) => i === index ? { ...ing, [field]: value } : ing));
  }, []);

  const addStep = useCallback(() => {
    setSteps((prev) => [...prev, '']);
  }, []);

  const removeStep = useCallback((index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateStep = useCallback((index: number, value: string) => {
    setSteps((prev) => prev.map((s, i) => i === index ? value : s));
  }, []);

  const cycleCategoryAt = useCallback((index: number) => {
    setIngredients((prev) => prev.map((ing, i) => {
      if (i !== index) return ing;
      const currentIdx = CATEGORIES.indexOf(ing.category);
      const nextIdx = (currentIdx + 1) % CATEGORIES.length;
      return { ...ing, category: CATEGORIES[nextIdx] };
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a recipe name.');
      return;
    }

    const validIngredients = ingredients.filter((ing) => ing.name.trim() && ing.amount.trim());
    if (validIngredients.length === 0) {
      Alert.alert('Missing ingredients', 'Add at least one ingredient.');
      return;
    }

    const validSteps = steps.filter((s) => s.trim());
    if (validSteps.length === 0) {
      Alert.alert('Missing steps', 'Add at least one preparation step.');
      return;
    }

    setSaving(true);

    const meal: MealCard = {
      id: `custom-${Date.now()}`,
      title: name.trim(),
      prepTimeMin: parseInt(prepTime, 10) || 30,
      level,
      ingredients: validIngredients.map((ing) => ({
        name: ing.name.trim(),
        amount: parseFloat(ing.amount) || 0,
        unit: ing.unit || 'g',
        category: ing.category,
      })),
      shortPrep: validSteps.join('. ') + '.',
    };

    try {
      await saveCustomMeal(meal);
      Alert.alert('Recipe saved!', `"${meal.title}" has been saved to your custom recipes.`);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save the recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [name, prepTime, level, ingredients, steps, navigation]);

  return (
    <ScreenContainer title="🍳 Create Recipe" subtitle="Build your own meal from scratch">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Recipe Name</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
            placeholder="e.g. Grandma's Ajiaco"
            placeholderTextColor={theme.muted}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Quick info row */}
        <View style={styles.infoRow}>
          <View style={styles.infoField}>
            <Text style={[styles.label, { color: theme.text }]}>⏱ Prep (min)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
              placeholder="30"
              placeholderTextColor={theme.muted}
              value={prepTime}
              onChangeText={setPrepTime}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.infoField}>
            <Text style={[styles.label, { color: theme.text }]}>👤 Servings</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
              placeholder="2"
              placeholderTextColor={theme.muted}
              value={servings}
              onChangeText={setServings}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Difficulty */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Difficulty</Text>
          <View style={styles.chipRow}>
            {SKILL_LEVELS.map((l) => (
              <Pressable
                key={l}
                onPress={() => setLevel(l)}
                style={[styles.chip, { borderColor: theme.border }, level === l && { borderColor: theme.primary, backgroundColor: theme.primary + '18' }]}
              >
                <Text style={[styles.chipText, { color: theme.muted }, level === l && { color: theme.primary, fontWeight: '700' }]}>{l}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Ingredients</Text>
          {ingredients.map((ing, i) => (
            <View key={i} style={styles.ingredientRow}>
              <TextInput
                style={[styles.ingNameInput, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
                placeholder="Ingredient"
                placeholderTextColor={theme.muted}
                value={ing.name}
                onChangeText={(v) => updateIngredient(i, 'name', v)}
              />
              <TextInput
                style={[styles.ingAmountInput, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
                placeholder="Qty"
                placeholderTextColor={theme.muted}
                value={ing.amount}
                onChangeText={(v) => updateIngredient(i, 'amount', v)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.ingUnitInput, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
                placeholder="unit"
                placeholderTextColor={theme.muted}
                value={ing.unit}
                onChangeText={(v) => updateIngredient(i, 'unit', v)}
              />
              <Pressable onPress={() => cycleCategoryAt(i)} style={[styles.catButton, { borderColor: theme.border }]}>
                <Text style={[styles.catButtonText, { color: theme.primary }]}>{ing.category.slice(0, 3)}</Text>
              </Pressable>
              {ingredients.length > 1 ? (
                <Pressable onPress={() => removeIngredient(i)} style={styles.removeButton}>
                  <Text style={{ color: theme.danger, fontWeight: '700' }}>✕</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
          <Pressable onPress={addIngredient} style={[styles.addButton, { borderColor: theme.primary }]}>
            <Text style={[styles.addButtonText, { color: theme.primary }]}>+ Add ingredient</Text>
          </Pressable>
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Preparation Steps</Text>
          {steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <TextInput
                style={[styles.stepInput, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
                placeholder={`Step ${i + 1}`}
                placeholderTextColor={theme.muted}
                value={step}
                onChangeText={(v) => updateStep(i, v)}
                multiline
              />
              {steps.length > 1 ? (
                <Pressable onPress={() => removeStep(i)} style={styles.removeButton}>
                  <Text style={{ color: theme.danger, fontWeight: '700' }}>✕</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
          <Pressable onPress={addStep} style={[styles.addButton, { borderColor: theme.primary }]}>
            <Text style={[styles.addButtonText, { color: theme.primary }]}>+ Add step</Text>
          </Pressable>
        </View>

        {/* Save button */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, { backgroundColor: theme.primary }, saving && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityLabel="Save recipe"
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving…' : '💾 Save Recipe'}</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 32 },
  section: { gap: 8 },
  label: { fontWeight: '700', fontSize: 14 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoField: { flex: 1, gap: 6 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 },
  chipText: { fontSize: 12, fontWeight: '500' },
  ingredientRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  ingNameInput: { flex: 3, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 8, fontSize: 13 },
  ingAmountInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 8, fontSize: 13, textAlign: 'center' },
  ingUnitInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 8, fontSize: 13, textAlign: 'center' },
  catButton: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 8 },
  catButtonText: { fontSize: 10, fontWeight: '700' },
  removeButton: { padding: 4 },
  addButton: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 10, padding: 10, alignItems: 'center' },
  addButtonText: { fontWeight: '600', fontSize: 13 },
  stepRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  stepNumber: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  stepNumberText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  stepInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, minHeight: 40 },
  saveButton: { borderRadius: 12, padding: 16, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
