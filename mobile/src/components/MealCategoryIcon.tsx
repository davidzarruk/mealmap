import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../theme/colors';

type MealCategory = 'chicken' | 'beef' | 'fish' | 'pasta' | 'rice' | 'soup' | 'salad' | 'egg' | 'vegetable' | 'wrap' | 'other';

const CATEGORY_CONFIG: Record<MealCategory, { emoji: string; bg: string }> = {
  chicken: { emoji: '🍗', bg: '#FEF3C7' },
  beef: { emoji: '🥩', bg: '#FEE2E2' },
  fish: { emoji: '🐟', bg: '#DBEAFE' },
  pasta: { emoji: '🍝', bg: '#FCE7F3' },
  rice: { emoji: '🍚', bg: '#F3E8FF' },
  soup: { emoji: '🍲', bg: '#D1FAE5' },
  salad: { emoji: '🥗', bg: '#ECFDF5' },
  egg: { emoji: '🥚', bg: '#FEF9C3' },
  vegetable: { emoji: '🥬', bg: '#DCFCE7' },
  wrap: { emoji: '🌯', bg: '#FFF7ED' },
  other: { emoji: '🍽️', bg: '#F1F5F9' },
};

function detectCategory(title: string): MealCategory {
  const t = title.toLowerCase();
  if (['chicken', 'pollo'].some((w) => t.includes(w))) return 'chicken';
  if (['beef', 'steak', 'meatball', 'carne'].some((w) => t.includes(w))) return 'beef';
  if (['fish', 'tuna', 'tilapia', 'salmon', 'seafood'].some((w) => t.includes(w))) return 'fish';
  if (['pasta', 'spaghetti', 'noodle'].some((w) => t.includes(w))) return 'pasta';
  if (['rice', 'paella', 'fried rice', 'arroz'].some((w) => t.includes(w))) return 'rice';
  if (['soup', 'stew', 'sancocho', 'ajiaco', 'cream'].some((w) => t.includes(w))) return 'soup';
  if (['salad', 'ensalada'].some((w) => t.includes(w))) return 'salad';
  if (['egg', 'omelette', 'perico'].some((w) => t.includes(w))) return 'egg';
  if (['vegetable', 'lentil', 'chickpea', 'bean', 'quinoa'].some((w) => t.includes(w))) return 'vegetable';
  if (['wrap', 'taco', 'burrito', 'arepa', 'burger'].some((w) => t.includes(w))) return 'wrap';
  return 'other';
}

type Props = {
  title: string;
  size?: number;
};

export function MealCategoryIcon({ title, size = 36 }: Props) {
  const theme = useThemeColors();
  const category = detectCategory(title);
  const config = CATEGORY_CONFIG[category];

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: config.bg }]}>
      <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>{config.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  emoji: { textAlign: 'center' },
});
