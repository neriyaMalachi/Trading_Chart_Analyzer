import { useQuery } from '@tanstack/react-query';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Analysis } from '@tca/types';

import { analysisApi } from '../api/analysis.api';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import type { TabScreenProps } from '../navigation/types';

export function HistoryScreen({ navigation }: TabScreenProps<'History'>): JSX.Element {
  const { data, isLoading } = useQuery({
    queryKey: ['analysis', 'history'],
    queryFn: analysisApi.history,
  });

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
      <DisclaimerBanner />
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 gap-3"
        ListEmptyComponent={
          <View className="items-center p-10">
            <Text className="text-muted">{isLoading ? 'Loading…' : 'No analyses yet.'}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <HistoryRow item={item} onPress={() => navigation.navigate('Result', { analysisId: item.id })} />
        )}
      />
    </SafeAreaView>
  );
}

function HistoryRow({ item, onPress }: { item: Analysis; onPress: () => void }): JSX.Element {
  const trendColor =
    item.trend === 'bullish' ? 'text-bullish' : item.trend === 'bearish' ? 'text-bearish' : 'text-sideways';
  return (
    <Pressable onPress={onPress} className="flex-row gap-3 rounded-xl bg-surface p-3">
      <Image source={{ uri: item.imageUrl }} className="h-20 w-20 rounded-lg" resizeMode="cover" />
      <View className="flex-1 justify-center">
        <Text className={`text-sm font-semibold ${trendColor}`}>{item.trend.toUpperCase()}</Text>
        <Text className="text-xs text-muted" numberOfLines={2}>
          {item.trendDescription}
        </Text>
        <Text className="mt-1 text-[10px] text-muted">{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </Pressable>
  );
}
