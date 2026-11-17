import { DarkTheme, Theme as NavigationTheme } from '@react-navigation/native';

export const colors = {
  background: '#0A0A0A',
  backgroundSecondary: '#121212',
  surface: '#1E1E1E',
  surfaceElevated: '#252525',
  surfaceBorder: '#333333',
  inputBorder: '#333333',

  primary: '#00E676',
  primaryDark: '#00C853',
  primaryMuted: 'rgba(0, 230, 118, 0.14)',

  accent: '#38BDF8',
  accentMuted: 'rgba(56, 189, 248, 0.14)',

  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textInverse: '#0A0A0A',

  criticidade: {
    CRITICA: '#EF4444',
    ALTA: '#F97316',
    MEDIA: '#F59E0B',
    BAIXA: '#38BDF8',
  },

  status: {
    ABERTO: '#EF4444',
    EM_ANALISE: '#F59E0B',
    EM_EXECUCAO: '#38BDF8',
    CONCLUIDO: '#00E676',
    CANCELADO: '#71717A',
  },

  success: '#00E676',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerMuted: 'rgba(239, 68, 68, 0.15)',
  info: '#38BDF8',
  overlay: 'rgba(0, 0, 0, 0.78)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 9999,
} as const;

export const shadows = {
  card: {
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
} as const;

export const typography = {
  h1: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bodyStrong: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textMuted,
  },
  mono: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.accent,
  },
};

export const FixItNavigationTheme: NavigationTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.surfaceBorder,
    notification: colors.primary,
  },
};

export const theme = {
  colors,
  spacing,
  radius,
  shadows,
  typography,
};

export default theme;
