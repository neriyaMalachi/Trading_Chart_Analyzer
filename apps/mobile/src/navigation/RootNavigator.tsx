import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoadingScreen } from '../screens/LoadingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PreviewScreen } from '../screens/PreviewScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';
import {useAuthStore} from "../stores/auth.store";

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: '#0B0B14' as const },
  headerTintColor: '#FFFFFF',
  contentStyle: { backgroundColor: '#0B0B14' as const },
} as const;

export function RootNavigator(): JSX.Element {
    const user = useAuthStore((state) => state.user);
  const isAuthed = user?.id;

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!isAuthed ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign in' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Preview" component={PreviewScreen} options={{ title: 'Review chart' }} />
          <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Analysis' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
