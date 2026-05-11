import Constants from 'expo-constants';

interface AppExtra {
  apiBaseUrl: string;
}

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<AppExtra>;

export const env: AppExtra = {
  apiBaseUrl: extra.apiBaseUrl ?? 'http://localhost:3000/api',
};
