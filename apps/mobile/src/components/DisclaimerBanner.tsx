import { DISCLAIMER_SHORT } from '@tca/constants';
import { Text, View } from 'react-native';

interface Props {
  variant?: 'inline' | 'footer';
}

export function DisclaimerBanner({ variant = 'inline' }: Props): JSX.Element {
  return (
    <View
      className={
        variant === 'footer'
          ? 'border-t border-white/10 bg-bg px-4 py-3'
          : 'mx-4 my-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2'
      }
    >
      <Text className="text-xs text-muted">{DISCLAIMER_SHORT}</Text>
    </View>
  );
}
