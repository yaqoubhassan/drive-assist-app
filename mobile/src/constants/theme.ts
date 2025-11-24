/**
 * DriveAssist Theme Constants
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
};

export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const LineHeight = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Component-specific constants
export const ComponentSize = {
  buttonHeight: 48,
  buttonHeightSmall: 40,
  inputHeight: 48,
  iconButtonSize: 40,
  avatarSm: 40,
  avatarMd: 60,
  avatarLg: 100,
  tabBarHeight: 60,
  headerHeight: 56,
};

// Animation durations (in ms)
export const AnimationDuration = {
  fast: 150,
  normal: 300,
  slow: 500,
};

export default {
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  LineHeight,
  Shadow,
  ComponentSize,
  AnimationDuration,
};
