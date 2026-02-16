import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ShoppingListSkeleton } from '../../components/Skeleton';
import { IngredientItem, initialWeekMeals, WeekMealsMap } from '../../data/plan';
import { consolidateIngredients } from '../../domain/planFlow.mjs';
import { trackEvent } from '../../lib/analytics';
import { loadWeekPlan } from '../../lib/planStorage';
import { loadShoppingOverrides, saveShoppingOverrides, ShoppingOverridesMap } from '../../lib/userPrefsStorage';
import { createOrGetCurrentPlan, saveShoppingListToSupabase, loadShoppingListFromSupabase, ShoppingItemRow, toggleShoppingItemChecked } from '../../lib/supabasePlanService';
import { getSubstitutions, SubstitutionSuggestion } from '../../lib/ingredientSubstitutions';
import { useThemeColors } from '../../theme/colors';

type ConsolidatedItem = IngredientItem;

const getOverrideKey = (category: IngredientItem['category'], item: ConsolidatedItem) => `${category}|${item.name}|${item.unit}`;

export function ShoppingListScreen() {
  const theme = useThemeColors();
  const [weekMeals, setWeekMeals] = useState<WeekMealsMap>(initialWeekMeals);
  const [overrides, setOverrides] = useState<ShoppingOverridesMap>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [substitutionTarget, setSubstitutionTarget] = useState<string | null>(null);
  const hasTrackedGenerationRef = useRef(false);

  const loadData = useCallback(async () => {
    const [storedPlan, storedOverrides] = await Promise.all([
      loadWeekPlan().catch(() => null),
      loadShoppingOverrides().catch(() => ({} as ShoppingOverridesMap)),
    ]);
    if (storedPlan) setWeekMeals(storedPlan);
    setOverrides(storedOverrides);

    // Try loading checked state from Supabase
    try {
      const plan = await createOrGetCurrentPlan();
      if (plan) {
        setCurrentPlanId(plan.id);
        const items = await loadShoppingListFromSupabase(plan.id);
        if (items) {
          const checked: Record<string, boolean> = {};
          for (const item of items) {
            const key = `${item.category}|${item.ingredient_name}|${item.unit ?? ''}`;
            checked[key] = item.checked;
          }
          setCheckedItems(checked);
        }
      }
    } catch {
      // Supabase unavailable
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData().finally(() => setLoading(false)); }, [loadData]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const grouped = useMemo(() => consolidateIngredients(weekMeals), [weekMeals]);
  const sections = Object.entries(grouped).filter(([, items]) => items.length > 0) as Array<[IngredientItem['category'], ConsolidatedItem[]]>;

  useEffect(() => {
    if (hasTrackedGenerationRef.current || sections.length === 0) return;
    hasTrackedGenerationRef.current = true;
    const totalItems = sections.reduce((acc, [, items]) => acc + items.length, 0);
    trackEvent('list_generated', { sections: sections.length, totalItems }).catch(() => undefined);
  }, [sections]);

  useEffect(() => { saveShoppingOverrides(overrides).catch(() => undefined); }, [overrides]);

  // Persist to Supabase when items change
  useEffect(() => {
    if (!currentPlanId || sections.length === 0) return;
    const timer = setTimeout(() => {
      const allItems = sections.flatMap(([category, items]) =>
        items.map((item) => {
          const key = getOverrideKey(category, item);
          const o = overrides[key];
          return {
            name: o?.name ?? item.name,
            amount: Number(o?.amount ?? item.amount),
            unit: o?.unit ?? item.unit,
            category,
            checked: checkedItems[`${category}|${item.name}|${item.unit}`] ?? false,
          };
        }),
      );
      saveShoppingListToSupabase(currentPlanId, allItems).catch(() => undefined);
    }, 1000);
    return () => clearTimeout(timer);
  }, [sections, overrides, checkedItems, currentPlanId]);

  const setItemOverride = (key: string, field: 'name' | 'amount' | 'unit', value: string, fallback: ConsolidatedItem) => {
    setOverrides((prev) => ({
      ...prev,
      [key]: {
        name: prev[key]?.name ?? fallback.name,
        amount: prev[key]?.amount ?? String(fallback.amount),
        unit: prev[key]?.unit ?? fallback.unit,
        [field]: value,
      },
    }));
  };

  const toggleChecked = (category: string, item: ConsolidatedItem) => {
    const key = `${category}|${item.name}|${item.unit}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetOverrides = () => {
    setOverrides({});
    setCheckedItems({});
  };

  const formatListAsText = useCallback((): string => {
    if (sections.length === 0) return '';
    const lines: string[] = ['🛒 Mealmap Shopping List', ''];
    sections.forEach(([category, items]) => {
      lines.push(`📦 ${category}`);
      items.forEach((item) => {
        const o = overrides[getOverrideKey(category, item)];
        const name = o?.name ?? item.name;
        const amount = o?.amount ?? String(item.amount);
        const unit = o?.unit ?? item.unit;
        const checked = checkedItems[`${category}|${item.name}|${item.unit}`];
        lines.push(`  ${checked ? '☑' : '☐'} ${name} — ${amount} ${unit}`);
      });
      lines.push('');
    });
    return lines.join('\n').trim();
  }, [sections, overrides, checkedItems]);

  const copyToClipboard = async () => {
    const text = formatListAsText();
    if (!text) return;
    await Clipboard.setStringAsync(text);
    trackEvent('list_generated', { action: 'copy_clipboard' }).catch(() => undefined);
    Alert.alert('Copied!', 'Shopping list copied to clipboard.');
  };

  const shareList = async () => {
    const text = formatListAsText();
    if (!text) return;
    try {
      await Share.share({ message: text });
      trackEvent('list_generated', { action: 'share' }).catch(() => undefined);
    } catch {
      // user cancelled or error
    }
  };

  if (loading) {
    return (
      <ScreenContainer title="Shopping list" subtitle="Loading your list…">
        <ShoppingListSkeleton />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Shopping list" subtitle="Consolidated ingredients grouped by category.">
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}>
        {sections.length === 0 ? (
          <View style={[styles.emptyCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No ingredients yet</Text>
            <Text style={[styles.emptyText, { color: theme.muted }]}>Approve at least one meal to generate your shopping list.</Text>
          </View>
        ) : null}

        {sections.length > 0 ? (
          <View style={styles.actionsRow}>
            <Pressable style={[styles.resetButton, { borderColor: theme.border, backgroundColor: theme.surface }]} onPress={resetOverrides} accessibilityRole="button" accessibilityLabel="Reset manual edits">
              <Text style={[styles.resetButtonText, { color: theme.text }]}>Reset edits</Text>
            </Pressable>
            <Pressable style={[styles.resetButton, { borderColor: theme.primary, backgroundColor: theme.surface }]} onPress={copyToClipboard} accessibilityRole="button" accessibilityLabel="Copy list to clipboard">
              <Text style={[styles.resetButtonText, { color: theme.primary }]}>📋 Copy</Text>
            </Pressable>
            <Pressable style={[styles.resetButton, { borderColor: theme.primary, backgroundColor: theme.primary }]} onPress={shareList} accessibilityRole="button" accessibilityLabel="Share shopping list">
              <Text style={[styles.resetButtonText, { color: '#FFFFFF' }]}>📤 Share</Text>
            </Pressable>
          </View>
        ) : null}

        {sections.map(([category, items]) => (
          <View key={category} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{category}</Text>
            {items.map((item) => {
              const key = getOverrideKey(category, item);
              const checkKey = `${category}|${item.name}|${item.unit}`;
              const override = overrides[key];
              const isChecked = checkedItems[checkKey] ?? false;
              const itemName = override?.name ?? item.name;
              const subs = substitutionTarget === checkKey ? getSubstitutions(itemName) : [];

              return (
                <View key={`${item.name}-${item.unit}`}>
                  <View style={styles.row}>
                    {/* F7-003: Checkbox */}
                    <Pressable onPress={() => toggleChecked(category, item)} style={[styles.checkbox, { borderColor: theme.border }, isChecked && { backgroundColor: theme.success, borderColor: theme.success }]}>
                      {isChecked ? <Text style={styles.checkmark}>✓</Text> : null}
                    </Pressable>
                    <TextInput value={itemName} onChangeText={(v) => setItemOverride(key, 'name', v, item)} style={[styles.input, styles.nameInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }, isChecked && styles.checkedText]} placeholder="Ingredient" placeholderTextColor={theme.muted} />
                    <TextInput value={override?.amount ?? String(item.amount)} onChangeText={(v) => setItemOverride(key, 'amount', v, item)} style={[styles.input, styles.amountInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }, isChecked && styles.checkedText]} placeholder="Qty" placeholderTextColor={theme.muted} keyboardType="numeric" />
                    <TextInput value={override?.unit ?? item.unit} onChangeText={(v) => setItemOverride(key, 'unit', v, item)} style={[styles.input, styles.unitInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }, isChecked && styles.checkedText]} placeholder="Unit" placeholderTextColor={theme.muted} />
                    {/* F7-008: Substitution button */}
                    <Pressable onPress={() => setSubstitutionTarget((prev) => prev === checkKey ? null : checkKey)} style={[styles.subButton, { borderColor: theme.border }]}>
                      <Text style={{ fontSize: 14 }}>🔄</Text>
                    </Pressable>
                  </View>
                  {/* F7-008: Substitution suggestions */}
                  {subs.length > 0 ? (
                    <View style={[styles.subsContainer, { borderColor: theme.border }]}>
                      <Text style={[styles.subsTitle, { color: theme.muted }]}>Substitutions:</Text>
                      {subs.map((sub) => (
                        <Pressable
                          key={sub.name}
                          onPress={() => {
                            setItemOverride(key, 'name', sub.name, item);
                            setSubstitutionTarget(null);
                          }}
                          style={[styles.subChip, { borderColor: theme.primary + '40', backgroundColor: theme.primary + '08' }]}
                        >
                          <Text style={[styles.subChipText, { color: theme.primary }]}>{sub.name}</Text>
                          <Text style={[styles.subChipNote, { color: theme.muted }]}>{sub.note}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 10, paddingBottom: 12 },
  emptyCard: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 4 },
  emptyTitle: { fontWeight: '700' },
  emptyText: {},
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' },
  resetButton: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  resetButtonText: { fontWeight: '600', fontSize: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 8 },
  sectionTitle: { fontWeight: '700', marginBottom: 2, textTransform: 'capitalize' },
  row: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 },
  nameInput: { flex: 1 },
  amountInput: { width: 60 },
  unitInput: { width: 55 },
  checkedText: { textDecorationLine: 'line-through', opacity: 0.5 },
  subButton: { borderWidth: 1, borderRadius: 8, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  subsContainer: { marginLeft: 28, marginTop: 4, marginBottom: 4, borderLeftWidth: 2, paddingLeft: 8, gap: 4 },
  subsTitle: { fontSize: 11, fontWeight: '600' },
  subChip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  subChipText: { fontSize: 12, fontWeight: '600' },
  subChipNote: { fontSize: 11 },
});
