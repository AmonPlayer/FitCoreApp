import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'FitCore',
  slug: 'fitcore',
  version: '1.0.0',
  scheme: 'fitcore',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0D0D0D',
  },
  ios: {
    bundleIdentifier: 'com.fitcore.app',
    supportsTablet: false,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0D0D0D',
    },
    package: 'com.fitcore.app',
  },
  plugins: [
    'expo-font',
    'expo-secure-store',
    [
      'expo-notifications',
      {
        icon: './assets/icon.png',
        color: '#1D9E75',
      },
    ],
  ],
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    usdaApiKey: process.env.USDA_API_KEY,
  },
  experiments: {
    tsconfigPaths: true,
  },
});
