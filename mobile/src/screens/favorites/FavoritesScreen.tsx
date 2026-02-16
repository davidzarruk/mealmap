/**
 * F10-001: Meal Favorites Collection
 *
 * Dedicated screen showing all favorited meals with search, category filter,
 * and quick actions (unfavorite, view details).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ScreenContainer';
import { MealCategoryIcon } from '../../components/MealCategoryIcon';
import { MealCard, initialWeekMeals, replacementPool, dayTabs } from '../../data/plan';
import { loadFavoriteMealIds, saveFavoriteMealIds } from '../../lib/userPrefsStorage';
import { estimateMealNutrition } from '../../lib/nutritionEstimation';
import { useThemeColors } from '../../theme/colors';
import { AppStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type CategoryFilter = 'all' | 'quick' | 'intermediate' | 'advanced';

/** Gather all known meals from initial + replacement pools */
function getAllMeals(): MealCard[] {
  const map = new Map<string, MealCard>();
  for (const day of dayTabs) {
    for (const meal of initialWeekMeals[day]) map.set(meal.id, meal);
    for (const meal of replacementPool[day]) map.set(meal.id, meal);
  }
  return Array.from(map.values());
}

export function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const theme = useThemeColors();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [loading, setLoading] = useState(true);

  const allMeals = useMemo(() => getAllMeals(), []);

  useEffect(() => {
    loadFavoriteMealIds()
      .then((ids) => { setFavoriteIds(ids); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const favoriteMeals = useMemo(() => {
    let meals = allMeals.filter((m) => favoriteIds.includes(m.id));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      meals = meals.filter((m) => m.title.toLowerCase().includes(q));
    }

    if (categoryFilter !== 'all') {
      const levelMap: Record<CategoryFilter, string> = {
        all: '',
        quick: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
      };
      meals = meals.filter((m) => m.level === levelMap[categoryFilter]);
    }

    return meals;
  }, [allMeals, favoriteIds, searchQuery, categoryFilter]);

  const removeFavorite = useCallback((mealId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.filter((id) => id !== mealId);
      saveFavoriteMealIds(next).catch(() => undefined);
      return next;
    });
  }, []);

  const navigateToDetails = useCallback((meal: MealCard) => {
    navigation.navigate('MealDetails', {
      slotId: meal.id,
      title: meal.title,
      prepTimeMin: meal.prepTimeMin,
      level: meal.level,
      ingredients: meal.ingredients,
      shortPrep: meal.shortPrep,
    });
  }, [navigation]);

  const renderMeal = useCallback(({ item }: { item: MealCard }) => {
    const nutrition = estimateMealNutrition(item.ingredients, 2);
    return (
      <Pressable
        style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}
        onPress={() => navigateToDetails(item)}
        accessibilityRole="button"
        accessibilityLabel={`View ${item.title}`}
      >
        <View style={styles.cardHeader}>
          <MealCategoryIcon title={item.title} size={40} />
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.metaChip, { color: theme.muted }]}>⏱ {item.prepTimeMin} min</Text>
              <Text style={[styles.metaChip, { color: theme.muted }]}>📊 {item.level}</Text>
              <Text style={[styles.metaChip, { color: theme.primary }]}>{nutrition.perServing.calories} kcal</Text>
            </View>
          </View>
          <Pressable
            onPress={() => removeFavorite(item.id)}
            style={[styles.unfavButton, { borderColor: theme.danger + '40' }]}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.title} from favorites`}
          >
            <Text style={{ color: theme.danger, fontSize: 16 }}>★</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  }, [theme, navigateToDetails, removeFavorite]);

  const filters: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'quick', label: '⚡ Quick' },
    { key: 'intermediate', label: '🍳 Medium' },
    { key: 'advanced', label: '👨‍🍳 Advanced' },
  ];

  if (loading) {
    return (
      <ScreenContainer title="Favorites" subtitle="Loading your favorite meals…">
        <View />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="⭐ Favorites" subtitle={`${favoriteIds.length} meals saved`}>
      <TextInput
        style={[styles.searchInput, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
        placeholder="🔍 Search favorites…"
        placeholderTextColor={theme.muted}
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
        accessibilityLabel="Search favorite meals"
      />

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setCategoryFilter(f.key)}
            style={[
              styles.filterChip,
              { borderColor: theme.border },
              categoryFilter === f.key && { borderColor: theme.primary, backgroundColor: theme.primary + '18' },
            ]}
          >
            <Text style={[
              styles.filterChipText,
              { color: theme.muted },
              categoryFilter === f.key && { color: theme.primary, fontWeight: '700' },
            ]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {favoriteMeals.length === 0 ? (
        <View style={[styles.emptyCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.emptyEmoji]}>⭐</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {favoriteIds.length === 0 ? 'No favorites yet' : 'No matches'}
          </Text>
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>
            {favoriteIds.length === 0
              ? 'Tap the ☆ icon on any meal card to save it here.'
              : 'Try a different search or filter.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteMeals}
          renderItem={renderMeal}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          scrollEnabled={false}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 8 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  filterChipText: { fontSize: 12, fontWeight: '500' },
  list: { gap: 10, paddingBottom: 20 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardInfo: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  metaRow: { flexDirection: 'row', gap: 8 },
  metaChip: { fontSize: 11, fontWeight: '500' },
  unfavButton: { borderWidth: 1, borderRadius: 14, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  emptyCard: { borderWidth: 1, borderRadius: 14, padding: 24, alignItems: 'center', gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontWeight: '700', fontSize: 16 },
  emptyCopy: { textAlign: 'center' },
});
