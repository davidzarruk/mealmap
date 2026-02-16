import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';

const ONBOARDING_DONE_KEY = 'mealmap/onboarding-done';

type RootNavigatorProps = {
  isAuthenticated: boolean;
};

export function RootNavigator({ isAuthenticated }: RootNavigatorProps) {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_DONE_KEY)
      .then((value) => setOnboardingDone(value === '1'))
      .catch(() => setOnboardingDone(true));
  }, []);

  if (onboardingDone === null) return null; // loading

  if (!onboardingDone && !isAuthenticated) {
    return (
      <OnboardingScreen
        onComplete={() => {
          setOnboardingDone(true);
          AsyncStorage.setItem(ONBOARDING_DONE_KEY, '1').catch(() => undefined);
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  return <AppNavigator />;
}
