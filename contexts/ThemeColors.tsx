import { useTheme } from './ThemeContext';

export const useThemeColors = () => {
  const { isDark } = useTheme();

  return {
    background: isDark ? '#151515' : '#ffffff',
    foreground: isDark ? '#ffffff' : '#151515',
    muted: isDark ? '#1d1d1d' : '#f7f7f7',
    mutedForeground: isDark ? '#d7d8da' : '#62646a',
    accent: isDark ? '#3b3c40' : '#ecedee',
    border: isDark ? '#27282a' : '#ecedee',
    primary: isDark ? '#1d1d1d' : '#151515',
    primaryForeground: '#ffffff',
    destructive: '#dc2626',
    destructiveForeground: '#ffffff',
    highlight: '#0EA5E9',
    icon: isDark ? '#ffffff' : '#151515',
    placeholder: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
    isDark,
  };
};

export default useThemeColors;
