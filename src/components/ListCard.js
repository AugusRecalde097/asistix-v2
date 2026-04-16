import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadow } from '../theme/colors';
import Avatar from './Avatar';

export default function ListCard({ title, subtitle, meta, avatarName, avatarColor = 'alumno', avatarSquare = false, onPress, rightText }) {
  return (
    <TouchableOpacity style={[styles.card, shadow.sm]} onPress={onPress} activeOpacity={0.75}>
      <Avatar name={avatarName || title} color={avatarColor} square={avatarSquare} size={42} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      {rightText ? <Text style={styles.rightText}>{rightText}</Text> : null}
      <Ionicons name="chevron-forward" size={16} color={colors.border} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  info: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: '500', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  meta: { fontSize: 11, color: colors.textHint, marginRight: 4 },
  rightText: { fontSize: 12, fontWeight: '500', color: colors.primary },
});
