import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/colors';

export default function EmptyState({ icon = 'document-outline', title, subtitle }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={40} color={colors.primaryLight} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl * 2 },
  iconBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { fontSize: 16, fontWeight: '500', color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
