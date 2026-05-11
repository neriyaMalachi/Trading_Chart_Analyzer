import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authApi } from '../api/auth.api';
import { ApiError } from '../api/client';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { PrimaryButton } from '../components/PrimaryButton';
import type { ScreenProps } from '../navigation/types';
import { useAuthStore } from '../stores/auth.store';

export function LoginScreen({ navigation }: ScreenProps<'Login'>): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setSession = useAuthStore((s) => s.setSession);

  const mutation = useMutation({
    mutationFn: () => authApi.login({ email: email.trim(), password }),
    onSuccess: (session) => setSession(session),
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.message : 'Login failed';
      Alert.alert('Sign in failed', message);
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
      <View className="flex-1 justify-between p-6">
        <View className="gap-4">
          <Text className="text-2xl font-bold text-white">Welcome back</Text>
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />
          <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <PrimaryButton
            label="Sign in"
            onPress={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!email || !password}
          />
          <PrimaryButton
            label="Create an account"
            variant="ghost"
            onPress={() => navigation.replace('Register')}
          />
        </View>
        <DisclaimerBanner variant="footer" />
      </View>
    </SafeAreaView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric';
}

function Field(props: FieldProps): JSX.Element {
  return (
    <View>
      <Text className="mb-1 text-sm text-muted">{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#64748B"
        secureTextEntry={props.secureTextEntry}
        autoCapitalize={props.autoCapitalize}
        keyboardType={props.keyboardType}
        className="rounded-xl border border-white/10 bg-surface px-4 py-3 text-base text-white"
      />
    </View>
  );
}
