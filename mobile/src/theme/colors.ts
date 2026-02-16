import { useColorScheme } from 'react-native';

export type ColorScheme = {
  primary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  success: string;
  danger: string;
};

export const lightColors: ColorScheme = {
  primary: '#4F46E5',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  success: '#16A34A',
  danger: '#DC2626',
};

export const darkColors: ColorScheme = {
  primary: '#818CF8',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F1F5F9',
  muted: '#94A3B8',
  border: '#334155',
  success: '#22C55E',
  danger: '#EF4444',
};

/** Static fallback — use `useThemeColors()` in components for dynamic dark mode. */
export const colors = lightColors;

/** Hook that returns the correct color palette based on system theme. */
export function useThemeColors(): ColorScheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}
