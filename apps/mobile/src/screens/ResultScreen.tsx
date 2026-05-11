import { useQuery } from '@tanstack/react-query';
import { Image, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Analysis, KeyLevel, TechnicalSignal, Trend } from '@tca/types';

import { analysisApi } from '../api/analysis.api';
import { PrimaryButton } from '../components/PrimaryButton';
import type { ScreenProps } from '../navigation/types';
import { useAnalysisStore } from '../stores/analysis.store';

const TREND_COPY: Record<Trend, { label: string; color: string }> = {
  bullish: { label: 'Bullish', color: 'text-bullish' },
  bearish: { label: 'Bearish', color: 'text-bearish' },
  sideways: { label: 'Sideways', color: 'text-sideways' },
};

export function ResultScreen({ navigation, route }: ScreenProps<'Result'>): JSX.Element {
  const stored = useAnalysisStore((s) => s.currentAnalysis);
  const analysisId = route.params?.analysisId;

  const { data, isLoading } = useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: () => analysisApi.byId(analysisId as string),
    enabled: Boolean(analysisId) && stored?.id !== analysisId,
    initialData: stored?.id === analysisId ? stored : undefined,
  });

  const analysis: Analysis | undefined = data ?? stored ?? undefined;

  if (isLoading || !analysis) {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Loading analysis…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const trend = TREND_COPY[analysis.trend];

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
      <ScrollView contentContainerClassName="p-6 gap-5">
        <View className="overflow-hidden rounded-xl bg-surface">
          <Image source={{ uri: analysis.imageUrl }} resizeMode="contain" style={{ width: '100%', height: 240 }} />
        </View>

        <Section title="Trend">
          <Text className={`text-2xl font-bold ${trend.color}`}>{trend.label}</Text>
          <Text className="mt-2 text-sm text-white/90 leading-5">{analysis.trendDescription}</Text>
        </Section>

        <Section title="Key levels">
          {analysis.keyLevels.length === 0 ? (
            <Text className="text-sm text-muted">No key levels identified.</Text>
          ) : (
            <View className="gap-3">{analysis.keyLevels.map((lvl, i) => <KeyLevelRow key={i} level={lvl} />)}</View>
          )}
        </Section>

        <Section title="Technical signals">
          {analysis.technicalSignals.length === 0 ? (
            <Text className="text-sm text-muted">No indicator signals visible on this chart.</Text>
          ) : (
            <View className="gap-3">{analysis.technicalSignals.map((s, i) => <SignalRow key={i} signal={s} />)}</View>
          )}
        </Section>

        <Section title="Points to watch">
          {analysis.pointsToWatch.length === 0 ? (
            <Text className="text-sm text-muted">Nothing flagged.</Text>
          ) : (
            <View className="gap-2">
              {analysis.pointsToWatch.map((p, i) => (
                <View key={i} className="flex-row gap-2">
                  <Text className="text-accent">•</Text>
                  <Text className="flex-1 text-sm text-white/90 leading-5">{p}</Text>
                </View>
              ))}
            </View>
          )}
        </Section>

        <View className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <Text className="text-xs text-muted leading-5">{analysis.disclaimer}</Text>
        </View>

        <View className="gap-3">
          <PrimaryButton
            label="Share"
            variant="secondary"
            onPress={() => {
              void Share.share({
                message: `Trading Chart Analyzer · ${trend.label}\n\n${analysis.trendDescription}\n\n— Educational only. Not financial advice.`,
              });
            }}
          />
          <PrimaryButton
            label="Analyse another chart"
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs', params: { screen: 'ImagePick' } }],
              })
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <View className="rounded-xl bg-surface p-4">
      <Text className="text-xs uppercase tracking-wide text-muted">{title}</Text>
      <View className="mt-2">{children}</View>
    </View>
  );
}

function KeyLevelRow({ level }: { level: KeyLevel }): JSX.Element {
  const isSupport = level.type === 'support';
  return (
    <View className="rounded-lg border border-white/10 p-3">
      <View className="flex-row items-baseline justify-between">
        <Text className={isSupport ? 'text-sm font-semibold text-bullish' : 'text-sm font-semibold text-bearish'}>
          {isSupport ? 'Support' : 'Resistance'}
        </Text>
        <Text className="text-base font-bold text-white">{level.price}</Text>
      </View>
      <Text className="mt-1 text-sm text-white/80 leading-5">{level.description}</Text>
    </View>
  );
}

function SignalRow({ signal }: { signal: TechnicalSignal }): JSX.Element {
  return (
    <View className="rounded-lg border border-white/10 p-3">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-sm font-semibold text-white">{signal.indicator}</Text>
        <Text className="text-xs text-muted uppercase">{signal.strength}</Text>
      </View>
      <Text className="mt-1 text-sm text-white/80">{signal.reading}</Text>
      <Text className="mt-1 text-sm text-white/60 leading-5">{signal.interpretation}</Text>
    </View>
  );
}
