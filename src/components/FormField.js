import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';

export default function FormField({
  label, value, onChangeText, placeholder, keyboardType = 'default',
  error, required = false, multiline = false, editable = true,
  onPress, icon, rightIcon,
}) {
  const [focused, setFocused] = useState(false);

  const containerStyle = [
    styles.input,
    focused && styles.inputFocused,
    error && styles.inputError,
    !editable && styles.inputDisabled,
    multiline && { height: 80, paddingTop: spacing.sm },
  ];

  return (
    <View style={styles.group}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {onPress ? (
        <TouchableOpacity onPress={onPress} style={containerStyle} activeOpacity={0.7}>
          {icon && <Ionicons name={icon} size={16} color={colors.textHint} style={styles.iconLeft} />}
          <Text style={[styles.inputText, !value && styles.placeholder]}>
            {value || placeholder}
          </Text>
          {rightIcon && <Ionicons name={rightIcon} size={16} color={colors.textHint} />}
        </TouchableOpacity>
      ) : (
        <View style={containerStyle}>
          {icon && <Ionicons name={icon} size={16} color={focused ? colors.primary : colors.textHint} style={styles.iconLeft} />}
          <TextInput
            style={[styles.inputText, { flex: 1 }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textHint}
            keyboardType={keyboardType}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            multiline={multiline}
            editable={editable}
          />
        </View>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: spacing.md },
  label: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, marginBottom: 5, letterSpacing: 0.2 },
  required: { color: colors.error },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: 44,
  },
  inputFocused: { borderColor: colors.primary, borderWidth: 1.5 },
  inputError: { borderColor: colors.error },
  inputDisabled: { backgroundColor: colors.surfaceAlt },
  inputText: { fontSize: 14, color: colors.text },
  placeholder: { color: colors.textHint },
  iconLeft: { marginRight: spacing.sm },
  error: { fontSize: 11, color: colors.error, marginTop: 3 },
});
