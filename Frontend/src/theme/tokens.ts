/**
 * E-Diary design tokens, derived from the E-Diary mobile UI screen pack.
 * Screens and components must reference these values instead of hardcoding styles.
 */
import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  primary: '#1E40AF',
  primaryPressed: '#1E3A8A',
  primarySoft: '#DBEAFE',
  onPrimary: '#FFFFFF',

  background: '#F2F5FA',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textDisabled: '#94A3B8',

  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  danger: '#B91C1C',
  dangerSoft: '#FEF2F2',
  dangerBorder: '#FECACA',
  success: '#15803D',
  successSoft: '#F0FDF4',
  successBorder: '#BBF7D0',
  info: '#1E40AF',
  infoSoft: '#EFF6FF',
  infoBorder: '#BFDBFE',
  warning: '#B45309',
  warningSoft: '#FFFBEB',

  /** Welcome (splash) screen and brand logo. */
  splashBackground: '#0B1F4D',
  brandRing: '#1DA9E1',
  brandBolt: '#EE1C25',

  /** Blue header band shared by every screen. */
  hero: '#1E40AF',
  heroDeep: '#172F80',
  heroDecor: 'rgba(255, 255, 255, 0.07)',
  onPrimaryMuted: '#BFDBFE',
  backdrop: 'rgba(11, 31, 77, 0.6)',

  disabled: '#CBD5E1',
  overlay: 'rgba(242, 245, 250, 0.96)',
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 30,
  price: 48,
} as const;

export const lineHeights = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 26,
  xl: 30,
  xxl: 36,
  hero: 38,
  price: 56,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

export const typography = {
  hero: { fontSize: fontSizes.hero, lineHeight: lineHeights.hero, fontWeight: fontWeights.bold, letterSpacing: -0.3 },
  price: { fontSize: fontSizes.price, lineHeight: lineHeights.price, fontWeight: fontWeights.bold, letterSpacing: -1 },
  display: { fontSize: fontSizes.xxl, lineHeight: lineHeights.xxl, fontWeight: fontWeights.bold },
  title: { fontSize: fontSizes.xl, lineHeight: lineHeights.xl, fontWeight: fontWeights.bold },
  heading: { fontSize: fontSizes.lg, lineHeight: lineHeights.lg, fontWeight: fontWeights.semibold },
  body: { fontSize: fontSizes.md, lineHeight: lineHeights.md, fontWeight: fontWeights.regular },
  bodyStrong: { fontSize: fontSizes.md, lineHeight: lineHeights.md, fontWeight: fontWeights.semibold },
  label: { fontSize: fontSizes.sm, lineHeight: lineHeights.sm, fontWeight: fontWeights.semibold },
  small: { fontSize: fontSizes.sm, lineHeight: lineHeights.sm, fontWeight: fontWeights.regular },
  caption: { fontSize: fontSizes.xs, lineHeight: lineHeights.xs, fontWeight: fontWeights.regular },
  overline: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  link: { fontSize: fontSizes.sm, lineHeight: lineHeights.sm, fontWeight: fontWeights.semibold },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const sizes = {
  inputHeight: 52,
  buttonHeight: 52,
  buttonHeightSm: 40,
  minTouchTarget: 44,
  brandMark: 36,
  statusIcon: 64,
  successIcon: 88,
  radio: 22,
  maxContentWidth: 480,
  borderWidth: 1,
  borderWidthFocus: 1.5,
} as const;

export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.08,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 4 },
    default: { boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' },
  }),
  button: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#1E40AF',
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 3 },
    default: { boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)' },
  }),
} as const;

export const cardStyle: ViewStyle = {
  backgroundColor: colors.surface,
  borderRadius: radius.xl,
  borderWidth: sizes.borderWidth,
  borderColor: colors.border,
  padding: spacing.xxl,
  ...shadows.card,
};
