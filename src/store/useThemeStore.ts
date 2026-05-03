import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'fitcore:theme';

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',

  setTheme: (theme) => {
    set({ theme });
    AsyncStorage.setItem(STORAGE_KEY, theme).catch(() => null);
  },

  loadTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        set({ theme: saved });
      }
    } catch {
      // ignore
    }
  },
}));
