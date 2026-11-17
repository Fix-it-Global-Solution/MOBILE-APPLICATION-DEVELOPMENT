import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../styles/theme';

interface CustomInputProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  icon,
  error,
  isPassword = false,
  style,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(isPassword);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          rest.multiline && styles.multilineContainer,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={19}
            color={
              error
                ? colors.danger
                : focused
                ? colors.primary
                : colors.textSecondary
            }
            style={[styles.leftIcon, rest.multiline && { marginTop: 4 }]}
          />
        )}

        <TextInput
          style={[
            styles.input,
            rest.multiline && styles.multilineInput,
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidePassword}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={colors.primary}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setHidePassword((prev) => !prev)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={hidePassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {!!error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs + 2,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 50,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingVertical: spacing.sm + 2,
    minHeight: 104,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  inputError: {
    borderColor: colors.danger,
  },
  leftIcon: {
    marginRight: spacing.sm + 2,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    paddingVertical: spacing.sm,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 84,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '500',
  },
});
