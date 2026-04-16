import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/colors';

export default function SectionHeader({ title, count }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {count !== undefined && <Text style={styles.count}>{count}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm, marginTop: spacing.sm },
  title: { fontSize: 11, fontWeight: '600', color: colors.textHint, letterSpacing: 0.8, textTransform: 'uppercase' },
  count: { fontSize: 11, color: colors.textHint },
});
