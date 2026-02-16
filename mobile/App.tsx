import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';
import { supabase } from './src/lib/supabase';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { OfflineBanner } from './src/components/OfflineBanner';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isBootingAuth, setIsBootingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (isMounted) {
          setSession(data.session ?? null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsBootingAuth(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
      },
    }),
    [],
  );

  if (isBootingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <AppErrorBoundary>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="dark" />
        <OfflineBanner />
        <RootNavigator isAuthenticated={Boolean(session)} />
      </NavigationContainer>
    </AppErrorBoundary>
  );
}
