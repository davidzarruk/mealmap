/**
 * F8-006: Interactive swipe tutorial
 *
 * Animated overlay showing a hand swiping left/right on first visit.
 * Dismisses automatically or on tap.
 */

import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColors } from '../theme/colors';

const TUTORIAL_SEEN_KEY = 'mealmap/swipe-tutorial-seen';

type Props = {
  /** Force show even if already seen (for testing) */
  forceShow?: boolean;
  onDismiss?: () => void;
};

export function SwipeTutorial({ forceShow, onDismiss }: Props) {
  const theme = useThemeColors();
  const [visible, setVisible] = useState(false);
  const handX = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const stepRef = useRef<'right' | 'left' | 'done'>('right');

  useEffect(() => {
    if (forceShow) {
      setVisible(true);
      return;
    }
    AsyncStorage.getItem(TUTORIAL_SEEN_KEY).then((val) => {
      if (!val) setVisible(true);
    });
  }, [forceShow]);

  useEffect(() => {
    if (!visible) return;

    // Fade in
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      runSwipeAnimation();
    });
  }, [visible]);

  const runSwipeAnimation = () => {
    // Swipe right demo
    stepRef.current = 'right';
    Animated.sequence([
      Animated.delay(400),
      // Move right
      Animated.timing(handX, {
        toValue: 120,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.delay(300),
      // Reset to center
      Animated.timing(handX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      // Swipe left demo
      Animated.timing(handX, {
        toValue: -120,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.delay(300),
      // Reset
      Animated.timing(handX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(600),
    ]).start(() => {
      // Loop if still visible
      if (stepRef.current !== 'done') {
        runSwipeAnimation();
      }
    });
  };

  const dismiss = async () => {
    stepRef.current = 'done';
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onDismiss?.();
    });
    await AsyncStorage.setItem(TUTORIAL_SEEN_KEY, '1');
  };

  // Auto-dismiss after 12 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => dismiss(), 12000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  const rightLabelOpacity = handX.interpolate({
    inputRange: [0, 60, 120],
    outputRange: [0.3, 0.7, 1],
    extrapolate: 'clamp',
  });

  const leftLabelOpacity = handX.interpolate({
    inputRange: [-120, -60, 0],
    outputRange: [1, 0.7, 0.3],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <Pressable style={styles.dismissArea} onPress={dismiss}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Swipe to decide</Text>

          <View style={styles.demoArea}>
            {/* Left label */}
            <Animated.View style={[styles.labelContainer, styles.leftLabel, { opacity: leftLabelOpacity }]}>
              <Text style={[styles.actionIcon, { color: theme.danger }]}>↻</Text>
              <Text style={[styles.actionText, { color: theme.danger }]}>Replace</Text>
            </Animated.View>

            {/* Hand emoji */}
            <Animated.View style={[styles.handContainer, { transform: [{ translateX: handX }] }]}>
              <Text style={styles.handEmoji}>👆</Text>
            </Animated.View>

            {/* Right label */}
            <Animated.View style={[styles.labelContainer, styles.rightLabel, { opacity: rightLabelOpacity }]}>
              <Text style={[styles.actionIcon, { color: theme.success }]}>✓</Text>
              <Text style={[styles.actionText, { color: theme.success }]}>Approve</Text>
            </Animated.View>
          </View>

          <Text style={[styles.hint, { color: theme.muted }]}>
            Swipe right to approve a meal{'\n'}Swipe left to get a replacement
          </Text>

          <View style={[styles.dismissButton, { backgroundColor: theme.primary }]}>
            <Text style={styles.dismissButtonText}>Got it!</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 24,
  },
  dismissArea: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  demoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    width: '100%',
  },
  labelContainer: {
    alignItems: 'center',
    width: 70,
  },
  leftLabel: {
    position: 'absolute',
    left: 10,
  },
  rightLabel: {
    position: 'absolute',
    right: 10,
  },
  actionIcon: {
    fontSize: 24,
    fontWeight: '700',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  handContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  handEmoji: {
    fontSize: 40,
  },
  hint: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
  },
  dismissButton: {
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  dismissButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
