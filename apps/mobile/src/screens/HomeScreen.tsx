import { LIMITS } from '@tca/constants';
import { useQuery } from '@tanstack/react-query';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authApi } from '../api/auth.api';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { PrimaryButton } from '../components/PrimaryButton';
import type { TabScreenProps } from '../navigation/types';
import { useAuthStore } from '../stores/auth.store';

export function HomeScreen({ navigation }: TabScreenProps<'Home'>): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);

  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await authApi.me();
      setUser(res.user);
      return res;
    },
  });

  const remaining =
    user?.tier === 'free' ? Math.max(0, LIMITS.FREE_DAILY_ANALYSES - user.dailyAnalysisCount) : null;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
      <ScrollView contentContainerClassName="flex-grow p-6 gap-4">
        <DisclaimerBanner />

        <View className="rounded-xl bg-surface p-4">
          <Text className="text-sm text-muted">Signed in as</Text>
          <Text className="text-base font-semibold text-white">{user?.email}</Text>
          <Text className="mt-2 text-xs text-muted">Tier: {user?.tier ?? 'free'}</Text>
          {remaining !== null && (
            <Text className="mt-1 text-xs text-muted">
              {remaining} of {LIMITS.FREE_DAILY_ANALYSES} free analyses remaining today
            </Text>
          )}
        </View>

        <PrimaryButton label="Analyse a new chart" onPress={() => navigation.navigate('ImagePick')} />
        <PrimaryButton label="View history" variant="secondary" onPress={() => navigation.navigate('History')} />
        <Pressable onPress={clear} className="mt-4 items-center">
          <Text className="text-sm text-muted underline">Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
