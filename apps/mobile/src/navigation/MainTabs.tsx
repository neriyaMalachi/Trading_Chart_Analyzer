import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ImagePickScreen } from '../screens/ImagePickScreen';
import { CustomTabBar } from './CustomTabBar';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: '#0B0B14' as const },
  headerTintColor: '#FFFFFF',
  sceneStyle: { backgroundColor: '#0B0B14' as const },
} as const;

export function MainTabs(): JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={screenOptions}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trading Chart Analyzer' }} />
      <Tab.Screen name="ImagePick" component={ImagePickScreen} options={{ title: 'New analysis' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
    </Tab.Navigator>
  );
}
