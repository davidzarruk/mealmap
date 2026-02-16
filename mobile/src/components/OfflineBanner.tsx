import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../theme/colors';

/**
 * Lightweight offline banner using fetch-based connectivity check.
 * No extra dependencies — works everywhere Expo runs.
 * Shows a persistent banner at the top when offline.
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const theme = useThemeColors();

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        // Lightweight HEAD request — Supabase health or Google generate_204
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        await fetch('https://clients3.google.com/generate_204', {
          method: 'HEAD',
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (mounted) setIsOffline(false);
      } catch {
        if (mounted) setIsOffline(true);
      }
    };

    check();
    const interval = setInterval(check, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <View style={[styles.banner, { backgroundColor: theme.danger }]}>
      <Text style={styles.text}>You're offline — some features may be unavailable</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
