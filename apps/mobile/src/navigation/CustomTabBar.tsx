import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MainTabParamList } from './types';
import { CameraIcon, ClockIcon, HomeIcon } from './TabIcons';

const ACCENT = '#7C5CFF';
const ICON_WHITE = '#FFFFFF';
const ICON_DIM = '#8E8E96';

const TAB_META: Record<keyof MainTabParamList, { label: string; Icon: typeof HomeIcon }> = {
  Home: { label: 'Home', Icon: HomeIcon },
  ImagePick: { label: 'Analyse', Icon: CameraIcon },
  History: { label: 'History', Icon: ClockIcon },
};

export function CustomTabBar({ state, navigation }: BottomTabBarProps): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingBottom: Math.max(insets.bottom, 12) }} className="bg-bg px-4 pt-2">
      <View className="flex-row items-center justify-between rounded-full border border-white/5 bg-surface p-2">
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name as keyof MainTabParamList];
          if (!meta) return null;
          const { label, Icon } = meta;
          const isFocused = state.index === index;

          const onPress = (): void => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as keyof MainTabParamList);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={onPress}
              className={
                isFocused
                  ? 'flex-row items-center gap-2 rounded-full bg-accent px-5 py-3'
                  : 'h-12 w-12 items-center justify-center rounded-full'
              }
            >
              <Icon color={isFocused ? ICON_WHITE : ICON_DIM} />
              {isFocused && (
                <Text className="text-sm font-semibold text-white">{label}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const TAB_BAR_COLORS = { ACCENT };
