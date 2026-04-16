export const colors = {
  primary: '#1565C0',
  primaryLight: '#1976D2',
  primaryDark: '#0D47A1',
  primarySurface: '#E3F2FD',
  primaryMid: '#BBDEFB',

  secondary: '#37474F',
  accent: '#FF6F00',

  background: '#F0F4F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFB',

  border: '#DCE3EB',
  borderLight: '#EEF2F6',

  text: '#1A2332',
  textSecondary: '#546E7A',
  textHint: '#90A4AE',

  success: '#2E7D32',
  successSurface: '#E8F5E9',
  warning: '#E65100',
  warningSurface: '#FFF3E0',
  error: '#C62828',
  errorSurface: '#FFEBEE',

  // Colores por entidad
  alumno: { bg: '#E3F2FD', text: '#1565C0' },
  curso: { bg: '#E8F5E9', text: '#2E7D32' },
  escuela: { bg: '#FFF8E1', text: '#F57F17' },
  localidad: { bg: '#F3E5F5', text: '#6A1B9A' },

  tabBar: '#FFFFFF',
  tabBarActive: '#1565C0',
  tabBarInactive: '#B0BEC5',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
};
