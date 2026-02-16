/**
 * F10-007: Leftover Tracker Screen
 *
 * View/add leftovers, mark as used, see meal suggestions that use them.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { MealCategoryIcon } from '../../components/MealCategoryIcon';
import { useThemeColors, ColorScheme } from '../../theme/colors';
import {
  Leftover,
  getLeftovers,
  addLeftover,
  markLeftoverUsed,
  removeLeftover,
  suggestMealsForLeftovers,
} from '../../lib/leftoverService';
import { MealCard } from '../../data/plan';

export function LeftoverTrackerScreen() {
  const theme = useThemeColors();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [leftovers, setLeftovers] = useState<Leftover[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [showUsed, setShowUsed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const items = await getLeftovers(showUsed);
    setLeftovers(items);
    setLoading(false);
  }, [showUsed]);

  useEffect(() => {
    load();
  }, [load]);

  const suggestions = useMemo(
    () => suggestMealsForLeftovers(leftovers),
    [leftovers],
  );

  const handleAdd = useCallback(async () => {
    const name = newName.trim();
    if (!name) return;
    await addLeftover({ ingredient_name: name });
    setNewName('');
    load();
  }, [newName, load]);

  const handleMarkUsed = useCallback(
    async (id: string) => {
      await markLeftoverUsed(id);
      load();
    },
    [load],
  );

  const handleRemove = useCallback(
    (id: string, name: string) => {
      Alert.alert('Remove leftover', `Remove "${name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeLeftover(id);
            load();
          },
        },
      ]);
    },
    [load],
  );

  const renderLeftover = useCallback(
    ({ item }: { item: Leftover }) => (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.ingredientName}>{item.ingredient_name}</Text>
          {item.amount != null && (
            <Text style={styles.amount}>
              {item.amount} {item.unit ?? ''}
            </Text>
          )}
        </View>
        {item.source_meal && (
          <Text style={styles.source}>From: {item.source_meal}</Text>
        )}
        <View style={styles.actions}>
          {!item.used && (
            <Pressable
              style={[styles.btn, { backgroundColor: theme.success }]}
              onPress={() => handleMarkUsed(item.id)}
            >
              <Text style={styles.btnText}>✓ Used</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.btn, { backgroundColor: theme.danger }]}
            onPress={() => handleRemove(item.id, item.ingredient_name)}
          >
            <Text style={styles.btnText}>✕ Remove</Text>
          </Pressable>
        </View>
      </View>
    ),
    [styles, theme, handleMarkUsed, handleRemove],
  );

  const renderSuggestion = useCallback(
    ({
      item,
    }: {
      item: { meal: MealCard; matchCount: number; matchedIngredients: string[] };
    }) => (
      <View style={styles.suggestionCard}>
        <MealCategoryIcon title={item.meal.title} size={32} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.mealTitle}>{item.meal.title}</Text>
          <Text style={styles.matchText}>
            Uses: {item.matchedIngredients.join(', ')} ({item.matchCount} match
            {item.matchCount !== 1 ? 'es' : ''})
          </Text>
        </View>
      </View>
    ),
    [styles],
  );

  return (
    <ScreenContainer title="Leftovers" subtitle="Track leftovers & get meal suggestions">
      {/* Add form */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Add leftover ingredient…"
          placeholderTextColor={theme.muted}
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={handleAdd}>
          <Text style={styles.btnText}>+ Add</Text>
        </Pressable>
      </View>

      {/* Toggle used */}
      <Pressable onPress={() => setShowUsed((p) => !p)}>
        <Text style={[styles.toggle, { color: theme.primary }]}>
          {showUsed ? 'Hide used' : 'Show used'}
        </Text>
      </Pressable>

      {/* Leftovers list */}
      <FlatList
        data={leftovers}
        keyExtractor={(item) => item.id}
        renderItem={renderLeftover}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? 'Loading…' : 'No leftovers tracked yet'}
          </Text>
        }
        style={{ maxHeight: 300 }}
      />

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>🍽️ Suggested meals</Text>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.meal.id}
            renderItem={renderSuggestion}
          />
        </>
      )}
    </ScreenContainer>
  );
}

function makeStyles(theme: ColorScheme) {
  return StyleSheet.create({
    addRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      color: theme.text,
      backgroundColor: theme.surface,
    },
    addBtn: { borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
    btnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    toggle: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    ingredientName: { color: theme.text, fontWeight: '600', fontSize: 15 },
    amount: { color: theme.muted, fontSize: 13 },
    source: { color: theme.muted, fontSize: 12, marginTop: 2 },
    actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
    btn: { borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
    sectionTitle: { color: theme.text, fontSize: 17, fontWeight: '700', marginTop: 16, marginBottom: 8 },
    suggestionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 10,
      padding: 10,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: theme.border,
    },
    mealTitle: { color: theme.text, fontWeight: '600', fontSize: 14 },
    matchText: { color: theme.success, fontSize: 12, marginTop: 2 },
    empty: { color: theme.muted, textAlign: 'center', marginTop: 20, fontSize: 14 },
  });
}
