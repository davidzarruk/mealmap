import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabsNavigator } from './MainTabsNavigator';
import { MealDetailsScreen } from '../screens/plan/MealDetailsScreen';
import { MealPrepScreen } from '../screens/plan/MealPrepScreen';
import { MealCalendarScreen } from '../screens/plan/MealCalendarScreen';
import { PlanHistoryScreen } from '../screens/plan/PlanHistoryScreen';
import { SetupScreen } from '../screens/setup/SetupScreen';
import { FavoritesScreen } from '../screens/favorites/FavoritesScreen';
import { CustomMealScreen } from '../screens/meals/CustomMealScreen';
import { CookingTimerScreen } from '../screens/cooking/CookingTimerScreen';
import { LeftoverTrackerScreen } from '../screens/leftovers/LeftoverTrackerScreen';
import { AppStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="Setup"
        component={SetupScreen}
        options={{ title: 'Plan setup', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="PlanHistory"
        component={PlanHistoryScreen}
        options={{ title: 'Plan history', animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="MealDetails"
        component={MealDetailsScreen}
        options={{
          title: 'Meal details',
          presentation: 'modal',
          animation: 'fade_from_bottom',
          animationDuration: 300,
        }}
      />
      <Stack.Screen
        name="MealPrep"
        component={MealPrepScreen}
        options={{ title: 'Meal Prep', animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="MealCalendar"
        component={MealCalendarScreen}
        options={{ title: 'Meal Calendar', animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favorites', animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CustomMeal"
        component={CustomMealScreen}
        options={{ title: 'Create Recipe', presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="CookingTimer"
        component={CookingTimerScreen}
        options={{ title: 'Cooking Timer', presentation: 'modal', animation: 'fade_from_bottom' }}
      />
      <Stack.Screen
        name="LeftoverTracker"
        component={LeftoverTrackerScreen}
        options={{ title: 'Leftovers', animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
