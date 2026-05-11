import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DisclaimerBanner } from '../components/DisclaimerBanner';

export function LoadingScreen(): JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <View className="flex-1 items-center justify-center p-6 gap-4">
        <ActivityIndicator size="large" color="#7C5CFF" />
        <Text className="text-base text-white">Reading the chart…</Text>
        <Text className="text-xs text-muted">This usually takes 5–15 seconds.</Text>
      </View>
      <DisclaimerBanner variant="footer" />
    </SafeAreaView>
  );
}
