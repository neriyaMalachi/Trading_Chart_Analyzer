import { ActivityIndicator, Pressable, Text } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
}: Props): JSX.Element {
  const isDisabled = disabled || loading;
  const base = 'rounded-xl px-5 py-3 items-center justify-center';
  const styles =
    variant === 'primary'
      ? 'bg-accent'
      : variant === 'secondary'
        ? 'bg-surface border border-white/10'
        : 'bg-transparent';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      className={`${base} ${styles} ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="text-base font-semibold text-white">{label}</Text>
      )}
    </Pressable>
  );
}
