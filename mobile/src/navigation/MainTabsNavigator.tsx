import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PlanScreen } from '../screens/plan/PlanScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ShoppingListScreen } from '../screens/shopping/ShoppingListScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabsNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center', animation: 'shift' }}>
      <Tab.Screen name="Plan" component={PlanScreen} options={{ title: 'Weekly Plan' }} />
      <Tab.Screen name="Shopping" component={ShoppingListScreen} options={{ title: 'Shopping List' }} />
      <Tab.Screen name="Insights" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
