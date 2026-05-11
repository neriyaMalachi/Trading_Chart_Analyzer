import { useMutation } from '@tanstack/react-query';
import { Alert, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { analysisApi } from '../api/analysis.api';
import { ApiError } from '../api/client';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { PrimaryButton } from '../components/PrimaryButton';
import type { ScreenProps } from '../navigation/types';
import { useAnalysisStore } from '../stores/analysis.store';

export function PreviewScreen({ navigation }: ScreenProps<'Preview'>): JSX.Element {
  const pending = useAnalysisStore((s) => s.pendingImage);
  const setCurrentAnalysis = useAnalysisStore((s) => s.setCurrentAnalysis);
  const setPendingImage = useAnalysisStore((s) => s.setPendingImage);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!pending) throw new Error('No pending image');
      return analysisApi.upload({ imageBase64: pending.base64, mimeType: pending.mimeType });
    },
    onMutate: () => navigation.navigate('Loading'),
    onSuccess: (analysis) => {
      setCurrentAnalysis(analysis);
      setPendingImage(null);
      navigation.replace('Result', { analysisId: analysis.id });
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.message : 'Analysis failed';
      navigation.goBack();
      Alert.alert('Could not analyse', message);
    },
  });

  if (!pending) {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-muted">No image selected.</Text>
          <PrimaryButton label="Pick again" onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs', params: { screen: 'ImagePick' } }],
              })
            } />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
      <View className="flex-1 justify-between p-6">
        <View className="gap-4">
          <Text className="text-xl font-semibold text-white">Review the chart</Text>
          <View className="overflow-hidden rounded-xl bg-surface">
            <Image source={{ uri: pending.uri }} resizeMode="contain" style={{ width: '100%', height: 320 }} />
          </View>
          <Text className="text-xs text-muted">
            Format: {pending.mimeType} · {(pending.sizeBytes / 1024).toFixed(0)} KB
          </Text>
        </View>

        <View className="gap-3">
          <PrimaryButton label="Analyse this chart" onPress={() => mutation.mutate()} loading={mutation.isPending} />
          <PrimaryButton label="Pick another" variant="secondary" onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs', params: { screen: 'ImagePick' } }],
              })
            } />
          <DisclaimerBanner variant="footer" />
        </View>
      </View>
    </SafeAreaView>
  );
}
