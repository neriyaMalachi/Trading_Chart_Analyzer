import { DISCLAIMER_TEXT } from '@tca/constants';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import type { ScreenProps } from '../navigation/types';

export function OnboardingScreen({ navigation }: ScreenProps<'Onboarding'>): JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="flex-grow justify-between p-6">
        <View className="mt-12">
          <Text className="text-3xl font-bold text-white">Trading Chart Analyzer</Text>
          <Text className="mt-3 text-base text-muted">We explain. You decide.</Text>

          <View className="mt-10 gap-4">
            <Bullet title="Snap or upload" body="Pick a chart screenshot from your gallery or capture one with your camera." />
            <Bullet title="AI explains" body="Get a structured breakdown: trend, key levels, indicators, points to watch." />
            <Bullet title="You stay in control" body="No buy/sell signals — just clear educational explanations." />
          </View>
        </View>

        <View className="gap-4 pb-6">
          <Text className="text-xs text-muted">{DISCLAIMER_TEXT}</Text>
          <PrimaryButton label="Create account" onPress={() => navigation.navigate('Register')} />
          <PrimaryButton label="I already have an account" variant="secondary" onPress={() => navigation.navigate('Login')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Bullet({ title, body }: { title: string; body: string }): JSX.Element {
  return (
    <View className="rounded-xl bg-surface p-4">
      <Text className="text-base font-semibold text-white">{title}</Text>
      <Text className="mt-1 text-sm text-muted">{body}</Text>
    </View>
  );
}
