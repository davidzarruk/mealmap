import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LayoutAnimation, Modal, PanResponder, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, UIManager, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PlanScreenSkeleton } from '../../components/Skeleton';
import { WeeklySummaryCard } from '../../components/WeeklySummaryCard';
import { WeeklyNutritionChart } from '../../components/WeeklyNutritionChart';
import { MealCategoryIcon } from '../../components/MealCategoryIcon';
import { dayTabs, DayKey, initialWeekMeals, MealCard, MealType, mealTypes, replacementPool, WeekMealsMap } from '../../data/plan';
import { getMealDescription } from '../../data/mealDescriptions';
import { approveTopCard as approveTopCardState, getPendingCards, replaceTopCard as replaceTopCardState } from '../../domain/planFlow.mjs';
import { trackEvent } from '../../lib/analytics';
import { measureAsync } from '../../lib/perf';
import { loadWeekPlan, saveWeekPlan } from '../../lib/planStorage';
import { loadFavoriteMealIds, saveFavoriteMealIds } from '../../lib/userPrefsStorage';
import { createOrGetCurrentPlan, saveMealsToSupabase, loadWeekPlanFromSupabase, rateMeal, getMealRatings, DIETARY_TAGS, DietaryTag, getUserDietaryFilters } from '../../lib/supabasePlanService';
import { searchMeals } from '../../lib/mealSearchService';
import { useThemeColors } from '../../theme/colors';
import { AppStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SWIPE_TIP_DISMISSED_KEY = 'mealmap/swipe-tip-dismissed';

function scaleMealIngredients(meal: MealCard, scale: number): MealCard {
  if (scale === 1) return meal;
  return {
    ...meal,
    ingredients: meal.ingredients.map((ing) => ({
      ...ing,
      amount: Math.round(ing.amount * scale * 100) / 100,
    })),
  };
}

function mealMatchesDietaryTags(meal: MealCard, tags: DietaryTag[]): boolean {
  if (tags.length === 0) return true;
  const title = meal.title.toLowerCase();
  const ingredientNames = meal.ingredients.map((i) => i.name.toLowerCase()).join(' ');
  const combined = `${title} ${ingredientNames}`;

  return tags.every((tag) => {
    switch (tag) {
      case 'vegetarian':
      case 'vegan':
        return !['chicken', 'beef', 'pork', 'turkey', 'tuna', 'tilapia', 'seafood', 'meat', 'steak'].some((w) => combined.includes(w));
      case 'gluten-free':
        return !['pasta', 'bread', 'tortilla', 'flour', 'bun', 'wrap'].some((w) => combined.includes(w));
      case 'high-protein':
        return ['chicken', 'beef', 'egg', 'tuna', 'turkey', 'beans', 'chickpea', 'lentil', 'seafood'].some((w) => combined.includes(w));
      case 'low-carb':
        return !['rice', 'pasta', 'potato', 'bread', 'corn flour', 'bun'].some((w) => combined.includes(w));
      case 'dairy-free':
        return !['cheese', 'milk', 'cream', 'dairy', 'yogurt'].some((w) => combined.includes(w));
      default:
        return true;
    }
  });
}

export function PlanScreen() {
  const navigation = useNavigation<NavigationProp>();
  const theme = useThemeColors();
  const [selectedDay, setSelectedDay] = useState<DayKey>('Mon');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('Almuerzo');
  const [weekMeals, setWeekMeals] = useState<WeekMealsMap>(initialWeekMeals);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [replaceCursorByDay, setReplaceCursorByDay] = useState<Record<DayKey, number>>({
    Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
  });
  const [showSwipeTooltip, setShowSwipeTooltip] = useState(false);
  const [favoriteMealIds, setFavoriteMealIds] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MealCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [mealRatings, setMealRatings] = useState<Record<string, -1 | 1>>({});
  const [portionScale, setPortionScale] = useState(1);
  const [activeDietaryTags, setActiveDietaryTags] = useState<DietaryTag[]>([]);
  const [showDietaryModal, setShowDietaryModal] = useState(false);
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const dragX = useRef(new Animated.Value(0)).current;

  // IT-001 FIX: Use refs for swipe handlers so PanResponder always calls latest state
  const approveRef = useRef<() => void>(() => {});
  const replaceRef = useRef<() => void>(() => {});

  const dismissSwipeTooltip = () => {
    setShowSwipeTooltip(false);
    AsyncStorage.setItem(SWIPE_TIP_DISMISSED_KEY, '1').catch(() => undefined);
  };

  useEffect(() => {
    AsyncStorage.getItem(SWIPE_TIP_DISMISSED_KEY)
      .then((value) => { if (!value) setShowSwipeTooltip(true); })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!showSwipeTooltip) return;
    const timer = setTimeout(() => dismissSwipeTooltip(), 9000);
    return () => clearTimeout(timer);
  }, [showSwipeTooltip]);

  const refreshPlan = useCallback(async () => {
    try {
      const plan = await createOrGetCurrentPlan();
      if (plan) {
        setCurrentPlanId(plan.id);
        const sbData = await loadWeekPlanFromSupabase(plan.id);
        if (sbData && Object.values(sbData.weekMeals).some((d) => d.length > 0)) {
          setWeekMeals(sbData.weekMeals);
          setApprovedIds(sbData.approvedIds);
          return;
        }
      }
    } catch { /* Supabase unavailable */ }

    try {
      const stored = await measureAsync('plan.loadWeekPlan', () => loadWeekPlan());
      if (stored) setWeekMeals(stored);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    const init = async () => {
      await refreshPlan();
      getMealRatings().then(setMealRatings).catch(() => undefined);
      getUserDietaryFilters().then(setActiveDietaryTags).catch(() => undefined);
      setLoading(false);
    };
    init();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshPlan();
    getMealRatings().then(setMealRatings).catch(() => undefined);
    setRefreshing(false);
  }, [refreshPlan]);

  useEffect(() => {
    const timer = setTimeout(() => {
      measureAsync('plan.saveWeekPlan', () => saveWeekPlan(weekMeals)).catch(() => undefined);
      if (currentPlanId) {
        saveMealsToSupabase(currentPlanId, weekMeals, approvedIds).catch(() => undefined);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [weekMeals, approvedIds, currentPlanId]);

  useEffect(() => {
    loadFavoriteMealIds().then((stored) => setFavoriteMealIds(stored)).catch(() => undefined);
  }, []);

  useEffect(() => { saveFavoriteMealIds(favoriteMealIds).catch(() => undefined); }, [favoriteMealIds]);

  const handleDayChange = useCallback((day: DayKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedDay(day);
  }, []);

  const handleMealTypeChange = useCallback((mt: MealType) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedMealType(mt);
  }, []);

  // IT-002: Search meals via mock LLM
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchMeals(query, selectedMealType);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [selectedMealType]);

  const addSearchResultToDay = useCallback((meal: MealCard) => {
    setWeekMeals((prev) => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], { ...meal, mealType: selectedMealType }],
    }));
    setSearchQuery('');
    setSearchResults([]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }, [selectedDay, selectedMealType]);

  const pendingCards = getPendingCards(weekMeals, selectedDay, approvedIds);
  const filteredCards = useMemo(() => {
    let cards = pendingCards as MealCard[];
    if (favoritesOnly) cards = cards.filter((meal) => favoriteMealIds.includes(meal.id));
    if (searchQuery.trim() && searchResults.length === 0) {
      const q = searchQuery.toLowerCase();
      cards = cards.filter((meal) => meal.title.toLowerCase().includes(q));
    }
    if (activeDietaryTags.length > 0) {
      cards = cards.filter((meal) => mealMatchesDietaryTags(meal, activeDietaryTags));
    }
    return cards;
  }, [pendingCards, favoritesOnly, favoriteMealIds, searchQuery, searchResults, activeDietaryTags]);

  // IT-004: Get approved (locked) cards for selected day
  const lockedCards = useMemo(() => {
    return weekMeals[selectedDay].filter((meal) => approvedIds.includes(meal.id));
  }, [weekMeals, selectedDay, approvedIds]);

  const visibleCards = filteredCards;

  const totalMeals = dayTabs.reduce((acc, day) => acc + weekMeals[day].length, 0);
  const dayTotalMeals = weekMeals[selectedDay].length;
  const dayApproved = weekMeals[selectedDay].filter((meal) => approvedIds.includes(meal.id)).length;
  const progressPct = useMemo(() => Math.round((approvedIds.length / totalMeals) * 100), [approvedIds.length, totalMeals]);

  const prevProgressRef = useRef(0);
  useEffect(() => {
    if (progressPct === 100 && prevProgressRef.current < 100 && !loading) {
      setShowCelebration(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      Animated.sequence([
        Animated.timing(celebrationOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(celebrationOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start(() => setShowCelebration(false));
    }
    prevProgressRef.current = progressPct;
  }, [progressPct, loading]);

  const approveTopCard = useCallback(() => {
    setApprovedIds((prev) =>
      approveTopCardState({ weekMeals, selectedDay, approvedIds: prev }),
    );
  }, [weekMeals, selectedDay]);

  const replaceTopCard = useCallback(() => {
    const next = replaceTopCardState({
      weekMeals, selectedDay, approvedIds, replaceCursorByDay, replacementPool,
    });
    setWeekMeals(next.weekMeals);
    setApprovedIds(next.approvedIds);
    setReplaceCursorByDay(next.replaceCursorByDay);
    if (next.replacement) {
      trackEvent('meal_swapped', { day: selectedDay, replacementId: next.replacement.id }).catch(() => undefined);
    }
  }, [weekMeals, selectedDay, approvedIds, replaceCursorByDay]);

  // IT-001 FIX: Keep refs in sync
  useEffect(() => {
    approveRef.current = approveTopCard;
    replaceRef.current = replaceTopCard;
  }, [approveTopCard, replaceTopCard]);

  const toggleFavorite = (mealId: string) => {
    Haptics.selectionAsync().catch(() => undefined);
    setFavoriteMealIds((prev) => (prev.includes(mealId) ? prev.filter((id) => id !== mealId) : [...prev, mealId]));
  };

  const handleRateMeal = (mealId: string, rating: -1 | 1) => {
    Haptics.selectionAsync().catch(() => undefined);
    const current = mealRatings[mealId];
    const newRating = current === rating ? undefined : rating;
    setMealRatings((prev) => {
      const next = { ...prev };
      if (newRating === undefined) {
        delete next[mealId];
      } else {
        next[mealId] = newRating;
      }
      return next;
    });
    if (newRating !== undefined) {
      rateMeal(mealId, newRating).catch(() => undefined);
    }
  };

  const toggleDietaryTag = (tag: DietaryTag) => {
    setActiveDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // IT-001 FIX: PanResponder uses refs to avoid stale closures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) => Math.abs(gestureState.dx) > 8,
      onPanResponderMove: Animated.event([null, { dx: dragX }], { useNativeDriver: false }),
      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dx > 120) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
          Animated.timing(dragX, { toValue: 420, duration: 140, useNativeDriver: false }).start(() => {
            dragX.setValue(0);
            approveRef.current();
          });
          return;
        }
        if (gestureState.dx < -120) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
          Animated.timing(dragX, { toValue: -420, duration: 140, useNativeDriver: false }).start(() => {
            dragX.setValue(0);
            replaceRef.current();
          });
          return;
        }
        Animated.spring(dragX, { toValue: 0, useNativeDriver: false, friction: 6, tension: 80 }).start();
      },
    }),
  ).current;

  if (loading) {
    return (
      <ScreenContainer title="This week" subtitle="Loading your meal plan…">
        <PlanScreenSkeleton />
      </ScreenContainer>
    );
  }

  const mealTypeEmoji: Record<MealType, string> = { Desayuno: '🌅', Almuerzo: '☀️', Cena: '🌙' };

  return (
    <ScreenContainer title="This week" subtitle="Swipe right to approve or left to replace meals." refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}>
      {showCelebration ? (
        <Animated.View style={[styles.celebrationBanner, { opacity: celebrationOpacity }]}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationTitle}>Week complete!</Text>
          <Text style={styles.celebrationCopy}>All meals approved. Your shopping list is ready!</Text>
        </Animated.View>
      ) : null}

      {/* Day selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {dayTabs.map((day) => {
          const active = day === selectedDay;
          return (
            <Pressable key={day} onPress={() => handleDayChange(day)} style={[styles.tab, { borderColor: theme.border, backgroundColor: theme.surface }, active && { borderColor: theme.primary, backgroundColor: theme.primary + '18' }]} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={`${day} tab`}>
              <Text style={[styles.tabText, { color: theme.text }, active && { color: theme.primary, fontWeight: '700' }]}>{day}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* IT-003: Meal type selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {mealTypes.map((mt) => {
          const active = mt === selectedMealType;
          return (
            <Pressable key={mt} onPress={() => handleMealTypeChange(mt)} style={[styles.mealTypeTab, { borderColor: theme.border, backgroundColor: theme.surface }, active && { borderColor: theme.primary, backgroundColor: theme.primary + '18' }]} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={`${mt} tab`}>
              <Text style={[styles.mealTypeTabText, { color: theme.text }, active && { color: theme.primary, fontWeight: '700' }]}>{mealTypeEmoji[mt]} {mt}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Search & filters */}
      <View style={styles.filterRow}>
        <TextInput
          style={[styles.searchInput, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
          placeholder="🔍 Search or describe any meal…"
          placeholderTextColor={theme.muted}
          value={searchQuery}
          onChangeText={handleSearch}
          accessibilityLabel="Search meals"
          returnKeyType="search"
        />
        <View style={styles.filterButtonsRow}>
          <Pressable style={[styles.filterButton, { borderColor: theme.border, backgroundColor: theme.surface }, favoritesOnly && { borderColor: theme.primary, backgroundColor: theme.primary + '18' }]} onPress={() => setFavoritesOnly((prev) => !prev)} accessibilityRole="togglebutton" accessibilityState={{ checked: favoritesOnly }} accessibilityLabel="Filter favorites only">
            <Text style={[styles.filterButtonText, { color: theme.text }, favoritesOnly && { color: theme.primary }]}>
              {favoritesOnly ? '★ Favorites' : '☆ Favorites'}
            </Text>
          </Pressable>
          {/* IT-005: Improved diet filter button */}
          <Pressable style={[styles.dietFilterButton, { borderColor: theme.border, backgroundColor: theme.surface }]} onPress={() => setShowDietaryModal(true)} accessibilityRole="button" accessibilityLabel="Open dietary filters">
            <Text style={[styles.dietFilterIcon]}>🏷️</Text>
            <Text style={[styles.dietFilterLabel, { color: theme.text }]}>Diet filters</Text>
            <Text style={[styles.dietFilterArrow, { color: theme.muted }]}>▾</Text>
          </Pressable>
        </View>
        {/* IT-005: Active diet chips */}
        {activeDietaryTags.length > 0 ? (
          <View style={styles.activeDietChipsRow}>
            {activeDietaryTags.map((tag) => (
              <Pressable key={tag} onPress={() => toggleDietaryTag(tag)} style={[styles.activeDietChip, { backgroundColor: theme.success + '18', borderColor: theme.success }]}>
                <Text style={[styles.activeDietChipText, { color: theme.success }]}>{tag}</Text>
                <Text style={[styles.activeDietChipX, { color: theme.success }]}>✕</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      {/* IT-002: Search results from mock LLM */}
      {searchResults.length > 0 ? (
        <View style={[styles.searchResultsContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.searchResultsTitle, { color: theme.text }]}>✨ Suggested meals</Text>
          {searchResults.map((meal) => (
            <Pressable key={meal.id} style={[styles.searchResultItem, { borderColor: theme.border }]} onPress={() => addSearchResultToDay(meal)}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.searchResultName, { color: theme.text }]}>{meal.title}</Text>
                {meal.description ? <Text style={[styles.searchResultDesc, { color: theme.muted }]} numberOfLines={1}>{meal.description}</Text> : null}
              </View>
              <Text style={[styles.searchResultAdd, { color: theme.primary }]}>+ Add</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {isSearching ? <Text style={[styles.searchingText, { color: theme.muted }]}>Searching…</Text> : null}

      {showSwipeTooltip ? (
        <View style={[styles.tooltipCard, { borderColor: theme.primary }]}>
          <Text style={[styles.tooltipTitle, { color: theme.text }]}>How swipes work</Text>
          <Text style={[styles.tooltipCopy, { color: theme.muted }]}>Swipe right to approve a meal, swipe left to replace it with a similar option.</Text>
          <Pressable onPress={dismissSwipeTooltip} style={[styles.tooltipButton, { backgroundColor: theme.primary }]}>
            <Text style={styles.tooltipButtonText}>Got it</Text>
          </Pressable>
        </View>
      ) : null}

      {/* IT-006: Swipe cards ABOVE analytics */}
      {/* IT-004: Locked (approved) cards shown first */}
      {lockedCards.length > 0 ? (
        <View style={styles.lockedSection}>
          <Text style={[styles.lockedSectionTitle, { color: theme.text }]}>✅ Confirmed meals</Text>
          {lockedCards.map((card) => {
            const desc = card.description || getMealDescription(card.id);
            return (
              <View key={card.id} style={[styles.lockedCard, { borderColor: theme.success, backgroundColor: theme.success + '08' }]}>
                <View style={styles.cardHeaderRow}>
                  <MealCategoryIcon title={card.title} size={32} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.lockedTitle, { color: theme.text }]}>{card.title}</Text>
                    {desc ? <Text style={[styles.mealDescription, { color: theme.muted }]} numberOfLines={2}>{desc}</Text> : null}
                  </View>
                  <View style={[styles.lockedBadge, { backgroundColor: theme.success }]}>
                    <Text style={styles.lockedBadgeText}>✓ Locked</Text>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaChip, { color: theme.muted, borderColor: theme.border }]}>{card.prepTimeMin} min</Text>
                  <Text style={[styles.metaChip, { color: theme.muted, borderColor: theme.border }]}>{card.level}</Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* Swipe deck */}
      <View style={styles.deckContainer}>
        {visibleCards.length === 0 ? (
          <View style={[styles.emptyCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>{favoritesOnly ? 'No favorite meals pending' : activeDietaryTags.length > 0 ? 'No meals match dietary filters' : `You're done for ${selectedDay}`}</Text>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              {favoritesOnly ? 'Turn off the favorites filter or mark more meals as favorites.' : activeDietaryTags.length > 0 ? 'Try removing some dietary filters.' : 'Switch to another day to keep planning your week.'}
            </Text>
          </View>
        ) : null}

        {visibleCards.map((card: MealCard, index: number) => {
          const isTop = index === 0;
          const scaledCard = scaleMealIngredients(card, portionScale);
          const desc = card.description || getMealDescription(card.id);
          const animatedStyle = isTop
            ? { transform: [{ translateX: dragX }, { rotate: dragX.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-8deg', '0deg', '8deg'] }) }] }
            : undefined;
          const CardWrapper = isTop ? Animated.View : View;
          const isFavorite = favoriteMealIds.includes(card.id);
          const mealRating = mealRatings[card.id];
          const approveOverlayOpacity = isTop ? dragX.interpolate({ inputRange: [0, 80, 160], outputRange: [0, 0.4, 0.85], extrapolate: 'clamp' }) : undefined;
          const replaceOverlayOpacity = isTop ? dragX.interpolate({ inputRange: [-160, -80, 0], outputRange: [0.85, 0.4, 0], extrapolate: 'clamp' }) : undefined;

          return (
            <CardWrapper
              key={card.id}
              style={[styles.mealCard, { borderColor: theme.border, backgroundColor: theme.surface, top: index * 8, zIndex: visibleCards.length - index }, animatedStyle]}
              {...(isTop ? panResponder.panHandlers : {})}
            >
              {isTop && approveOverlayOpacity ? (
                <Animated.View style={[styles.swipeOverlay, styles.approveOverlay, { opacity: approveOverlayOpacity }]} pointerEvents="none">
                  <Text style={styles.swipeOverlayIcon}>✓</Text>
                  <Text style={styles.swipeOverlayLabel}>Approve</Text>
                </Animated.View>
              ) : null}
              {isTop && replaceOverlayOpacity ? (
                <Animated.View style={[styles.swipeOverlay, styles.replaceOverlay, { opacity: replaceOverlayOpacity }]} pointerEvents="none">
                  <Text style={styles.swipeOverlayIcon}>↻</Text>
                  <Text style={styles.swipeOverlayLabel}>Replace</Text>
                </Animated.View>
              ) : null}
              <Pressable onPress={() => navigation.navigate('MealDetails', { slotId: `${selectedDay}-${index + 1}`, title: scaledCard.title, prepTimeMin: scaledCard.prepTimeMin, level: scaledCard.level, ingredients: scaledCard.ingredients, shortPrep: scaledCard.shortPrep })}>
                <View style={styles.cardHeaderRow}>
                  <MealCategoryIcon title={card.title} size={36} />
                  <Text style={[styles.mealTitle, { color: theme.text }]}>{card.title}</Text>
                  <Pressable onPress={() => toggleFavorite(card.id)} style={[styles.favoriteButton, { borderColor: theme.border, backgroundColor: theme.surface }]} accessibilityRole="button" accessibilityLabel={isFavorite ? `Remove ${card.title} from favorites` : `Add ${card.title} to favorites`}>
                    <Text style={[styles.favoriteButtonText, { color: theme.primary }]}>{isFavorite ? '★' : '☆'}</Text>
                  </Pressable>
                </View>
                {/* IT-007: Meal description */}
                {desc ? <Text style={[styles.mealDescription, { color: theme.muted }]} numberOfLines={2}>{desc}</Text> : null}
                <View style={styles.metaRow}>
                  <Text style={[styles.metaChip, { color: theme.muted, borderColor: theme.border }]}>{card.prepTimeMin} min</Text>
                  <Text style={[styles.metaChip, { color: theme.muted, borderColor: theme.border }]}>{card.level}</Text>
                  {portionScale !== 1 ? <Text style={[styles.metaChip, { color: theme.primary, borderColor: theme.primary + '40' }]}>{portionScale}× portions</Text> : null}
                  {isFavorite ? <Text style={[styles.favoriteBadge, { color: theme.primary, borderColor: theme.primary + '40' }]}>Favorite</Text> : null}
                </View>
                <View style={styles.ratingRow}>
                  <Pressable onPress={() => handleRateMeal(card.id, 1)} style={[styles.ratingButton, { borderColor: theme.border }, mealRating === 1 && { borderColor: theme.success, backgroundColor: theme.success + '18' }]}>
                    <Text style={[styles.ratingEmoji, mealRating === 1 && { opacity: 1 }]}>👍</Text>
                  </Pressable>
                  <Pressable onPress={() => handleRateMeal(card.id, -1)} style={[styles.ratingButton, { borderColor: theme.border }, mealRating === -1 && { borderColor: theme.danger, backgroundColor: theme.danger + '18' }]}>
                    <Text style={[styles.ratingEmoji, mealRating === -1 && { opacity: 1 }]}>👎</Text>
                  </Pressable>
                </View>
                {isTop ? <Text style={[styles.swipeHint, { color: theme.primary }]}>← Replace · Approve →</Text> : null}
              </Pressable>
            </CardWrapper>
          );
        })}
      </View>

      {/* IT-006: Analytics moved BELOW swipe cards */}
      <View style={[styles.progressCard, { borderColor: theme.border, backgroundColor: theme.surface }]} accessibilityRole="summary" accessibilityLabel={`Weekly progress: ${progressPct} percent, ${approvedIds.length} of ${totalMeals} meals approved`}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: theme.text }]}>Weekly progress</Text>
          <Text style={[styles.progressPct, { color: theme.primary }]}>{progressPct}%</Text>
        </View>
        <Text style={[styles.progressCopy, { color: theme.muted }]}>
          {approvedIds.length} of {totalMeals} meals approved
        </Text>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: theme.primary }]} />
        </View>
        <Text style={[styles.dayProgressText, { color: theme.muted }]}>
          {selectedDay}: {dayApproved}/{dayTotalMeals} approved
        </Text>
      </View>

      <WeeklySummaryCard weekMeals={weekMeals} approvedIds={approvedIds} />
      <WeeklyNutritionChart weekMeals={weekMeals} servings={portionScale * 2} />

      <View style={[styles.portionRow, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <Text style={[styles.portionLabel, { color: theme.text }]}>Portions:</Text>
        {[0.5, 1, 1.5, 2, 3].map((s) => (
          <Pressable key={s} onPress={() => setPortionScale(s)} style={[styles.portionChip, { borderColor: theme.border }, portionScale === s && { borderColor: theme.primary, backgroundColor: theme.primary + '18' }]}>
            <Text style={[styles.portionChipText, { color: theme.text }, portionScale === s && { color: theme.primary, fontWeight: '700' }]}>{s}×</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={[styles.secondaryButton, { borderColor: theme.border }]} onPress={() => navigation.navigate('MealPrep', { weekMealsJson: JSON.stringify(weekMeals), approvedIds })} accessibilityRole="button" accessibilityLabel="Meal prep mode">
        <Text style={[styles.secondaryButtonText, { color: theme.text }]}>🍳 Meal prep mode</Text>
      </Pressable>

      <Pressable style={[styles.secondaryButton, { borderColor: theme.border }]} onPress={() => navigation.navigate('MealCalendar')} accessibilityRole="button" accessibilityLabel="Meal calendar">
        <Text style={[styles.secondaryButtonText, { color: theme.text }]}>📆 Meal calendar</Text>
      </Pressable>

      <Pressable style={[styles.secondaryButton, { borderColor: theme.border }]} onPress={() => navigation.navigate('PlanHistory' as never)} accessibilityRole="button" accessibilityLabel="View plan history">
        <Text style={[styles.secondaryButtonText, { color: theme.text }]}>📅 Plan history</Text>
      </Pressable>

      <Pressable style={[styles.secondaryButton, { borderColor: theme.border }]} onPress={() => navigation.navigate('Setup')} accessibilityRole="button" accessibilityLabel="Adjust preferences">
        <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Adjust preferences</Text>
      </Pressable>

      {/* IT-005: Diet filter modal */}
      <Modal visible={showDietaryModal} transparent animationType="slide" onRequestClose={() => setShowDietaryModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowDietaryModal(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.surface }]} onPress={() => {}}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>🏷️ Dietary Preferences</Text>
            <Text style={[styles.modalSubtitle, { color: theme.muted }]}>Select filters to show matching meals only</Text>
            <View style={styles.modalChipsContainer}>
              {DIETARY_TAGS.map((tag) => {
                const active = activeDietaryTags.includes(tag);
                const tagEmojis: Record<string, string> = {
                  'vegetarian': '🥬', 'vegan': '🌱', 'gluten-free': '🌾', 'high-protein': '💪', 'low-carb': '📉', 'dairy-free': '🥛',
                };
                return (
                  <Pressable key={tag} onPress={() => toggleDietaryTag(tag)} style={[styles.modalChip, { borderColor: theme.border, backgroundColor: theme.surface }, active && { borderColor: theme.success, backgroundColor: theme.success + '18' }]}>
                    <Text style={styles.modalChipEmoji}>{tagEmojis[tag] ?? '🏷️'}</Text>
                    <Text style={[styles.modalChipText, { color: theme.text }, active && { color: theme.success, fontWeight: '700' }]}>{tag}</Text>
                    {active ? <Text style={[styles.modalChipCheck, { color: theme.success }]}>✓</Text> : null}
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={[styles.modalDoneButton, { backgroundColor: theme.primary }]} onPress={() => setShowDietaryModal(false)}>
              <Text style={styles.modalDoneText}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  progressCard: { borderWidth: 1, borderRadius: 12, padding: 14 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle: { fontWeight: '700', marginBottom: 4 },
  progressPct: { fontWeight: '700' },
  progressCopy: { marginBottom: 10 },
  progressTrack: { height: 8, borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: 8 },
  dayProgressText: { marginTop: 8, fontSize: 12 },
  portionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, padding: 10 },
  portionLabel: { fontWeight: '600', fontSize: 13 },
  portionChip: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  portionChipText: { fontSize: 12, fontWeight: '500' },
  tooltipCard: { borderWidth: 1, borderRadius: 12, backgroundColor: '#eef5ff', padding: 12, gap: 6 },
  tooltipTitle: { fontWeight: '700' },
  tooltipCopy: {},
  tooltipButton: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  tooltipButtonText: { color: '#fff', fontWeight: '600' },
  tabsRow: { gap: 8, paddingVertical: 6 },
  tab: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  tabText: { fontWeight: '500' },
  mealTypeTab: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  mealTypeTabText: { fontWeight: '500', fontSize: 14 },
  filterRow: { marginBottom: 10, gap: 8 },
  filterButtonsRow: { flexDirection: 'row', gap: 8 },
  searchInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  filterButton: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  filterButtonText: { fontWeight: '600', fontSize: 12 },
  // IT-005: Diet filter button styles
  dietFilterButton: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  dietFilterIcon: { fontSize: 14 },
  dietFilterLabel: { fontWeight: '600', fontSize: 12 },
  dietFilterArrow: { fontSize: 10, marginLeft: 2 },
  activeDietChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  activeDietChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 14, paddingHorizontal: 8, paddingVertical: 3 },
  activeDietChipText: { fontSize: 11, fontWeight: '600' },
  activeDietChipX: { fontSize: 10, fontWeight: '700' },
  // Search results
  searchResultsContainer: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 },
  searchResultsTitle: { fontWeight: '700', fontSize: 14, marginBottom: 4 },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, paddingVertical: 8 },
  searchResultName: { fontWeight: '600', fontSize: 14 },
  searchResultDesc: { fontSize: 12, marginTop: 2 },
  searchResultAdd: { fontWeight: '700', fontSize: 13 },
  searchingText: { fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  // Locked cards (IT-004)
  lockedSection: { gap: 8, marginBottom: 8 },
  lockedSectionTitle: { fontWeight: '700', fontSize: 15 },
  lockedCard: { borderWidth: 1.5, borderRadius: 12, padding: 12, gap: 6 },
  lockedTitle: { fontWeight: '700', fontSize: 15 },
  lockedBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  lockedBadgeText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  // Meal description (IT-007)
  mealDescription: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  deckContainer: { minHeight: 320, marginBottom: 12 },
  mealCard: { position: 'absolute', left: 0, right: 0, borderWidth: 1, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  mealTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4, flex: 1 },
  favoriteButton: { borderWidth: 1, borderRadius: 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  favoriteButtonText: { fontSize: 16, lineHeight: 18 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaChip: { fontSize: 12, fontWeight: '600', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  favoriteBadge: { fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  ratingRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  ratingButton: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  ratingEmoji: { fontSize: 16, opacity: 0.5 },
  swipeHint: { marginTop: 10, fontWeight: '600' },
  emptyCard: { borderWidth: 1, borderRadius: 14, padding: 16 },
  emptyTitle: { fontWeight: '700', marginBottom: 4 },
  emptyCopy: {},
  secondaryButton: { borderWidth: 1, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  secondaryButtonText: { fontWeight: '600' },
  celebrationBanner: { backgroundColor: '#f0fdf4', borderWidth: 2, borderColor: '#22c55e', borderRadius: 14, padding: 20, alignItems: 'center', gap: 4 },
  celebrationEmoji: { fontSize: 40 },
  celebrationTitle: { fontSize: 20, fontWeight: '800', color: '#15803d' },
  celebrationCopy: { fontSize: 14, color: '#166534', textAlign: 'center' },
  swipeOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 14, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  approveOverlay: { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderWidth: 2, borderColor: 'rgba(34, 197, 94, 0.6)' },
  replaceOverlay: { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderWidth: 2, borderColor: 'rgba(239, 68, 68, 0.5)' },
  swipeOverlayIcon: { fontSize: 32, fontWeight: '700' },
  swipeOverlayLabel: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  // IT-005: Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, marginBottom: 16 },
  modalChipsContainer: { gap: 10 },
  modalChip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  modalChipEmoji: { fontSize: 18 },
  modalChipText: { fontSize: 14, flex: 1 },
  modalChipCheck: { fontSize: 16, fontWeight: '700' },
  modalDoneButton: { marginTop: 20, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalDoneText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
