import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useThemeColors } from '../theme/colors';

type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const theme = useThemeColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        { width: width as any, height, borderRadius, opacity, backgroundColor: theme.border },
        style,
      ]}
    />
  );
}

export function PlanScreenSkeleton() {
  const theme = useThemeColors();
  return (
    <View style={styles.container}>
      <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <Skeleton width="50%" height={14} />
        <Skeleton width="80%" height={10} style={{ marginTop: 8 }} />
        <Skeleton width="100%" height={8} borderRadius={4} style={{ marginTop: 10 }} />
      </View>
      <View style={styles.tabsRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} width={44} height={36} borderRadius={18} />
        ))}
      </View>
      <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <Skeleton width="70%" height={18} />
        <View style={styles.metaRow}>
          <Skeleton width={60} height={24} borderRadius={12} />
          <Skeleton width={50} height={24} borderRadius={12} />
        </View>
        <Skeleton width="40%" height={14} style={{ marginTop: 10 }} />
      </View>
    </View>
  );
}

export function ShoppingListSkeleton() {
  const theme = useThemeColors();
  return (
    <View style={styles.container}>
      {[1, 2].map((section) => (
        <View key={section} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Skeleton width="35%" height={16} />
          {[1, 2, 3].map((row) => (
            <View key={row} style={styles.itemRow}>
              <Skeleton width="55%" height={32} />
              <Skeleton width={60} height={32} />
              <Skeleton width={60} height={32} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {},
  container: { gap: 12, paddingVertical: 4 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  tabsRow: { flexDirection: 'row', gap: 8 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  itemRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
});
