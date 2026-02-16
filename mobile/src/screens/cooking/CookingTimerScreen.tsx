/**
 * F10-006: Cooking Timer
 *
 * Countdown timer with visual display, vibration + sound on completion.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useThemeColors } from '../../theme/colors';
import { AppStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, 'CookingTimer'>;

type TimerState = 'idle' | 'running' | 'paused' | 'done';

function formatTime(totalSeconds: number): { minutes: string; seconds: string } {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return {
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
  };
}

export function CookingTimerScreen({ route }: Props) {
  const { stepIndex, durationMin, stepLabel } = route.params;
  const theme = useThemeColors();

  const totalSeconds = durationMin * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [state, setState] = useState<TimerState>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;
  const { minutes, seconds } = formatTime(remaining);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleDone = useCallback(() => {
    clearTimer();
    setState('done');
    // Vibration pattern: buzz-pause-buzz-pause-buzz
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }, [clearTimer]);

  const start = useCallback(() => {
    if (remaining <= 0) return;
    setState('running');
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [remaining]);

  const pause = useCallback(() => {
    clearTimer();
    setState('paused');
  }, [clearTimer]);

  const resume = useCallback(() => {
    start();
  }, [start]);

  const reset = useCallback(() => {
    clearTimer();
    setRemaining(totalSeconds);
    setState('idle');
  }, [clearTimer, totalSeconds]);

  // Watch for timer reaching 0
  useEffect(() => {
    if (remaining <= 0 && state === 'running') {
      handleDone();
    }
  }, [remaining, state, handleDone]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Ring color based on progress
  const ringColor = state === 'done'
    ? theme.success
    : progress > 0.75
      ? '#E6A817'
      : theme.primary;

  return (
    <ScreenContainer title={`⏱ Step ${stepIndex + 1}`} subtitle={stepLabel}>
      <View style={styles.container}>
        {/* Circular timer display */}
        <View style={[styles.timerCircle, { borderColor: ringColor }]}>
          <View style={[styles.timerInner, { backgroundColor: theme.surface }]}>
            {state === 'done' ? (
              <>
                <Text style={styles.doneEmoji}>✅</Text>
                <Text style={[styles.doneText, { color: theme.success }]}>Done!</Text>
              </>
            ) : (
              <>
                <Text style={[styles.timerText, { color: theme.text }]}>
                  {minutes}:{seconds}
                </Text>
                <Text style={[styles.timerLabel, { color: theme.muted }]}>
                  {state === 'idle' ? 'Ready' : state === 'paused' ? 'Paused' : 'Cooking…'}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: ringColor }]} />
        </View>

        <Text style={[styles.totalTime, { color: theme.muted }]}>
          Total: {durationMin} min
        </Text>

        {/* Controls */}
        <View style={styles.controls}>
          {state === 'idle' && (
            <Pressable
              onPress={start}
              style={[styles.primaryButton, { backgroundColor: theme.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Start timer"
            >
              <Text style={styles.primaryButtonText}>▶ Start</Text>
            </Pressable>
          )}

          {state === 'running' && (
            <Pressable
              onPress={pause}
              style={[styles.primaryButton, { backgroundColor: '#E6A817' }]}
              accessibilityRole="button"
              accessibilityLabel="Pause timer"
            >
              <Text style={styles.primaryButtonText}>⏸ Pause</Text>
            </Pressable>
          )}

          {state === 'paused' && (
            <View style={styles.buttonRow}>
              <Pressable
                onPress={resume}
                style={[styles.primaryButton, { backgroundColor: theme.primary, flex: 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Resume timer"
              >
                <Text style={styles.primaryButtonText}>▶ Resume</Text>
              </Pressable>
              <Pressable
                onPress={reset}
                style={[styles.secondaryButton, { borderColor: theme.border, flex: 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Reset timer"
              >
                <Text style={[styles.secondaryButtonText, { color: theme.text }]}>↺ Reset</Text>
              </Pressable>
            </View>
          )}

          {state === 'done' && (
            <Pressable
              onPress={reset}
              style={[styles.primaryButton, { backgroundColor: theme.success }]}
              accessibilityRole="button"
              accessibilityLabel="Reset timer"
            >
              <Text style={styles.primaryButtonText}>↺ Reset & Start Again</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 24, paddingTop: 20 },
  timerCircle: { width: 220, height: 220, borderRadius: 110, borderWidth: 8, justifyContent: 'center', alignItems: 'center' },
  timerInner: { width: 196, height: 196, borderRadius: 98, justifyContent: 'center', alignItems: 'center' },
  timerText: { fontSize: 48, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timerLabel: { fontSize: 14, marginTop: 4 },
  doneEmoji: { fontSize: 48 },
  doneText: { fontSize: 24, fontWeight: '800', marginTop: 4 },
  progressTrack: { width: '80%', height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6 },
  totalTime: { fontSize: 13 },
  controls: { width: '80%', gap: 12 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  primaryButton: { borderRadius: 14, padding: 16, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryButton: { borderWidth: 1, borderRadius: 14, padding: 16, alignItems: 'center' },
  secondaryButtonText: { fontWeight: '600', fontSize: 16 },
});
