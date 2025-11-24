/**
 * DriveAssist Color Palette
 * Designed for Ghanaian market
 */

export const Colors = {
  // Primary Blue
  primary: {
    DEFAULT: '#3B82F6',
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Secondary Emerald
  secondary: {
    DEFAULT: '#10B981',
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Accent Amber
  accent: {
    DEFAULT: '#F59E0B',
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Neutral Slate
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Light Theme
  light: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },

  // Dark Theme
  dark: {
    background: '#111827',
    surface: '#1F2937',
    border: '#374151',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
  },

  // Gradient Colors for Splash
  gradient: {
    start: '#1a237e',
    end: '#673ab7',
  },

  // Transparent
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
};

export const LightTheme = {
  background: Colors.light.background,
  surface: Colors.light.surface,
  border: Colors.light.border,
  textPrimary: Colors.light.textPrimary,
  textSecondary: Colors.light.textSecondary,
  textMuted: Colors.light.textMuted,
  primary: Colors.primary.DEFAULT,
  secondary: Colors.secondary.DEFAULT,
  accent: Colors.accent.DEFAULT,
};

export const DarkTheme = {
  background: Colors.dark.background,
  surface: Colors.dark.surface,
  border: Colors.dark.border,
  textPrimary: Colors.dark.textPrimary,
  textSecondary: Colors.dark.textSecondary,
  textMuted: Colors.dark.textMuted,
  primary: Colors.primary[400],
  secondary: Colors.secondary[400],
  accent: Colors.accent[400],
};

export default Colors;
