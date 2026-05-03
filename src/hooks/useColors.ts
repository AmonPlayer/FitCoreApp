import { Colors } from '@/constants/colors';
import { useThemeStore } from '@/store/useThemeStore';

export function useColors() {
  const theme = useThemeStore((s) => s.theme);
  return theme === 'dark' ? Colors.dark : Colors.light;
}

export function useTheme() {
  return useThemeStore((s) => s.theme);
}
