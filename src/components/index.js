// src/components/index.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, radius, shadow } from '../theme';

// ─── Avatar ─────────────────────────────────────────────────────────────────

export const Avatar = ({ name = '', size = 40, color = colors.primary, bgColor = colors.primarySurface }) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.35, color }]}>{initials}</Text>
    </View>
  );
};

// ─── Badge ───────────────────────────────────────────────────────────────────

export const Badge = ({ label, bg = colors.primarySurface, textColor = colors.primary, size = 'md' }) => (
  <View style={[styles.badge, { backgroundColor: bg, paddingHorizontal: size === 'sm' ? 6 : 10, paddingVertical: size === 'sm' ? 2 : 4 }]}>
    <Text style={[styles.badgeText, { color: textColor, fontSize: size === 'sm' ? 10 : 11 }]}>{label}</Text>
  </View>
);

// ─── Card ────────────────────────────────────────────────────────────────────

export const Card = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
};

// ─── ListItem ────────────────────────────────────────────────────────────────

export const ListItem = ({ left, title, subtitle, right, onPress, style }) => (
  <TouchableOpacity style={[styles.listItem, style]} onPress={onPress} activeOpacity={0.7}>
    {left && <View style={styles.listItemLeft}>{left}</View>}
    <View style={styles.listItemCenter}>
      <Text style={styles.listItemTitle} numberOfLines={1}>{title}</Text>
      {subtitle ? <Text style={styles.listItemSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
    </View>
    {right && <View style={styles.listItemRight}>{right}</View>}
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

// ─── SearchBar ───────────────────────────────────────────────────────────────

export const SearchBar = ({ value, onChangeText, placeholder = 'Buscar...', style }) => (
  <View style={[styles.searchBar, style]}>
    <Text style={styles.searchIcon}>⌕</Text>
    <TextInput
      style={styles.searchInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textTertiary}
      returnKeyType="search"
      clearButtonMode="while-editing"
    />
  </View>
);

// ─── Input ───────────────────────────────────────────────────────────────────

export const Input = ({ label, error, style, containerStyle, ...props }) => (
  <View style={[styles.inputContainer, containerStyle]}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <TextInput
      style={[styles.input, error && styles.inputError, style]}
      placeholderTextColor={colors.textTertiary}
      {...props}
    />
    {error && <Text style={styles.inputErrorText}>{error}</Text>}
  </View>
);

// ─── Button ──────────────────────────────────────────────────────────────────

export const Button = ({ title, onPress, variant = 'primary', disabled = false, loading = false, style }) => {
  const variantStyle = {
    primary: { bg: colors.primary, text: '#fff', border: colors.primary },
    secondary: { bg: '#fff', text: colors.primary, border: colors.primary },
    danger: { bg: colors.danger, text: '#fff', border: colors.danger },
    ghost: { bg: 'transparent', text: colors.primary, border: 'transparent' },
  }[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: variantStyle.bg, borderColor: variantStyle.border },
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.text} />
      ) : (
        <Text style={[styles.buttonText, { color: variantStyle.text }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// ─── SectionHeader ───────────────────────────────────────────────────────────

export const SectionHeader = ({ title, action, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── StatCard ────────────────────────────────────────────────────────────────

export const StatCard = ({ value, label, color = colors.primary, bgColor = colors.primarySurface }) => (
  <View style={[styles.statCard, { backgroundColor: bgColor }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── EmptyState ──────────────────────────────────────────────────────────────

export const EmptyState = ({ icon = '📋', title, subtitle, actionLabel, onAction }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    {actionLabel && (
      <TouchableOpacity style={styles.emptyAction} onPress={onAction}>
        <Text style={styles.emptyActionText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Divider ─────────────────────────────────────────────────────────────────

export const Divider = ({ style }) => <View style={[styles.divider, style]} />;

// ─── LoadingView ─────────────────────────────────────────────────────────────

export const LoadingView = () => (
  <View style={styles.loadingView}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

// ─── Picker simple ───────────────────────────────────────────────────────────

export const SelectField = ({ label, value, placeholder, onPress, error, containerStyle }) => (
  <View style={[styles.inputContainer, containerStyle]}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <TouchableOpacity
      style={[styles.input, styles.selectField, error && styles.inputError]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={value ? styles.selectValue : styles.selectPlaceholder} numberOfLines={1}>
        {value || placeholder}
      </Text>
      <Text style={styles.selectChevron}>▾</Text>
    </TouchableOpacity>
    {error && <Text style={styles.inputErrorText}>{error}</Text>}
  </View>
);

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Avatar
  avatar: { justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: '600' },

  // Badge
  badge: { borderRadius: radius.full, alignSelf: 'flex-start' },
  badgeText: { fontWeight: '600' },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },

  // ListItem
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
    ...shadow.sm,
  },
  listItemLeft: { marginRight: spacing.md },
  listItemCenter: { flex: 1, marginRight: spacing.sm },
  listItemTitle: { ...typography.h4, marginBottom: 2 },
  listItemSubtitle: { ...typography.bodySmall },
  listItemRight: { marginRight: spacing.sm },
  chevron: { color: colors.textTertiary, fontSize: 20, fontWeight: '300' },

  // SearchBar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  searchIcon: { fontSize: 18, color: colors.textTertiary, marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary, paddingVertical: 0 },

  // Input
  inputContainer: { marginBottom: spacing.md },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.textPrimary,
  },
  inputError: { borderColor: colors.danger },
  inputErrorText: { fontSize: 12, color: colors.danger, marginTop: 4 },

  // Button
  button: {
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 15, fontWeight: '600' },

  // SectionHeader
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionAction: { fontSize: 13, color: colors.primary, fontWeight: '500' },

  // StatCard
  statCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    flex: 1,
  },
  statValue: { fontSize: 26, fontWeight: '700', lineHeight: 30 },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },

  // EmptyState
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl * 2, paddingHorizontal: spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, textAlign: 'center', marginBottom: spacing.sm },
  emptySubtitle: { ...typography.bodySmall, textAlign: 'center', lineHeight: 20 },
  emptyAction: {
    marginTop: spacing.lg,
    backgroundColor: colors.primarySurface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  emptyActionText: { color: colors.primary, fontWeight: '600', fontSize: 14 },

  // Divider
  divider: { height: 0.5, backgroundColor: colors.border, marginVertical: spacing.sm },

  // LoadingView
  loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // SelectField
  selectField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectValue: { fontSize: 14, color: colors.textPrimary, flex: 1 },
  selectPlaceholder: { fontSize: 14, color: colors.textTertiary, flex: 1 },
  selectChevron: { fontSize: 14, color: colors.textTertiary },
});
