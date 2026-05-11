import { TERMS_ACKNOWLEDGEMENT } from '@tca/constants';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authApi } from '../api/auth.api';
import { ApiError } from '../api/client';
import { PrimaryButton } from '../components/PrimaryButton';
import type { ScreenProps } from '../navigation/types';
import { useAuthStore } from '../stores/auth.store';

export function RegisterScreen({ navigation }: ScreenProps<'Register'>): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);

  const mutation = useMutation({
    mutationFn: () =>
      authApi.register({
        email: email.trim(),
        password,
        acceptedDisclaimer: true,
      }),
    onSuccess: (session) => setSession(session),
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.message : 'Registration failed';
      Alert.alert('Sign up failed', message);
    },
  });

  const canSubmit = email.length > 0 && password.length >= 8 && accepted;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
      <View className="flex-1 justify-between p-6">
        <View className="gap-4">
          <Text className="text-2xl font-bold text-white">Create your account</Text>

          <View>
            <Text className="mb-1 text-sm text-muted">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor="#64748B"
              className="rounded-xl border border-white/10 bg-surface px-4 py-3 text-base text-white"
            />
          </View>

          <View>
            <Text className="mb-1 text-sm text-muted">Password (8+ chars, upper, lower, number)</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="rounded-xl border border-white/10 bg-surface px-4 py-3 text-base text-white"
            />
          </View>

          <Pressable
            accessibilityRole="checkbox"
            onPress={() => setAccepted((v) => !v)}
            className="flex-row gap-3 rounded-xl bg-surface p-4"
          >
            <View
              className={`h-5 w-5 rounded border ${
                accepted ? 'border-accent bg-accent' : 'border-white/30'
              }`}
            />
            <Text className="flex-1 text-sm text-muted">{TERMS_ACKNOWLEDGEMENT}</Text>
          </Pressable>

          <PrimaryButton
            label="Create account"
            onPress={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!canSubmit}
          />
          <PrimaryButton
            label="Already have an account?"
            variant="ghost"
            onPress={() => navigation.replace('Login')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
