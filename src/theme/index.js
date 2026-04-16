// src/theme/index.js

export const colors = {
  // Primarios
  primary: '#1565C0',
  primaryDark: '#0D47A1',
  primaryLight: '#1976D2',
  primarySurface: '#E3F2FD',
  primaryText: '#1565C0',

  // Neutros
  background: '#F4F6F9',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  border: '#E0E7EF',
  borderLight: '#EEF2F7',

  // Texto
  textPrimary: '#1A2332',
  textSecondary: '#546E7A',
  textTertiary: '#90A4AE',
  textOnPrimary: '#FFFFFF',

  // Semánticos
  success: '#2E7D32',
  successSurface: '#E8F5E9',
  warning: '#E65100',
  warningSurface: '#FFF3E0',
  danger: '#C62828',
  dangerSurface: '#FFEBEE',
  info: '#1565C0',
  infoSurface: '#E3F2FD',

  // Cursos / badges
  curso1: { bg: '#E3F2FD', text: '#1565C0' },
  curso2: { bg: '#E8F5E9', text: '#2E7D32' },
  curso3: { bg: '#FFF8E1', text: '#F57F17' },
  curso4: { bg: '#F3E5F5', text: '#6A1B9A' },
  curso5: { bg: '#FCE4EC', text: '#AD1457' },
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  h2: { fontSize: 20, fontWeight: '600', color: colors.textPrimary },
  h3: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  h4: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 14, fontWeight: '400', color: colors.textPrimary },
  bodySmall: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
  caption: { fontSize: 11, fontWeight: '400', color: colors.textTertiary },
  label: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const shadow = {
  sm: {
    shadowColor: '#1A2332',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A2332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
};

export default { colors, typography, spacing, radius, shadow };
