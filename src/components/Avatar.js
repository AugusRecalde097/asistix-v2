import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';

export default function Avatar({ name, size = 40, color = 'alumno', square = false }) {
  const initials = name
    ? name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')
    : '?';
  const scheme = colors[color] || colors.alumno;
  return (
    <View style={[
      styles.base,
      { width: size, height: size, backgroundColor: scheme.bg, borderRadius: square ? radius.sm : size / 2 }
    ]}>
      <Text style={[styles.text, { color: scheme.text, fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '600' },
});
