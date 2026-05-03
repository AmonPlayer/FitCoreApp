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
    supabaseUrl: process.env.SUPABASE_URL ?? 'https://hukwmdknwjyklwaspoam.supabase.co',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1a3dtZGtud2p5a2x3YXNwb2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NjM2NjQsImV4cCI6MjA5MzMzOTY2NH0.v74muhmvCQVHoh5dp39TdLOnCpWW5SrmSBiwHuUWbtQ',
    usdaApiKey: process.env.USDA_API_KEY ?? 'DEMO_KEY',
  },
  experiments: {
    tsconfigPaths: true,
  },
  newArchEnabled: false,
});
