import { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View, ViewToken } from 'react-native';
import { useThemeColors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Slide = { id: string; emoji: string; title: string; description: string };

const slides: Slide[] = [
  { id: '1', emoji: '👆', title: 'Swipe to decide', description: 'Swipe right to approve a meal, swipe left to replace it. Simple as that.' },
  { id: '2', emoji: '📅', title: 'Plan your week', description: 'Get a full 7-day meal plan tailored to your preferences and cooking level.' },
  { id: '3', emoji: '🛒', title: 'Shop smart', description: 'Your shopping list is auto-generated and grouped by category. No duplicates.' },
];

type OnboardingScreenProps = { onComplete: () => void };

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const theme = useThemeColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const isLast = currentIndex === slides.length - 1;

  const goNext = () => {
    if (isLast) {
      onComplete();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.description, { color: theme.muted }]}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === currentIndex ? theme.primary : theme.border }]} />
          ))}
        </View>

        <Pressable style={[styles.button, { backgroundColor: theme.primary }]} onPress={goNext}>
          <Text style={styles.buttonText}>{isLast ? 'Get started' : 'Next'}</Text>
        </Pressable>

        {!isLast ? (
          <Pressable onPress={onComplete} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: theme.muted }]}>Skip</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emoji: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  footer: { paddingHorizontal: 40, paddingBottom: 50, alignItems: 'center', gap: 16 },
  dotsRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  button: { width: '100%', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  skipButton: { paddingVertical: 8 },
  skipText: { fontSize: 14 },
});
