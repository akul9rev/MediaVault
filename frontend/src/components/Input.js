import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  Pressable 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

/**
 * Reusable Premium Text Input Component
 * Supports custom labels, icons, secure entry visibility toggle, and Zod error formatting.
 */
export const Input = ({
  label,
  icon,
  error,
  secureTextEntry,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const showPasswordToggle = secureTextEntry;
  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View 
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInputContainer,
          error && styles.errorInputContainer
        ]}
      >
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={error ? colors.danger : (isFocused ? colors.primary : colors.placeholder)} 
            style={styles.icon} 
          />
        )}
        
        <TextInput
          placeholderTextColor={colors.placeholder}
          secureTextEntry={isSecure}
          style={styles.textInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          {...props}
        />
        
        {showPasswordToggle && (
          <Pressable 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.passwordToggle}
          >
            <Ionicons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={colors.placeholder} 
            />
          </Pressable>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    width: '100%'
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs
  },
  inputContainer: {
    height: 54,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md
  },
  focusedInputContainer: {
    borderColor: colors.primary
  },
  errorInputContainer: {
    borderColor: colors.danger
  },
  icon: {
    marginRight: spacing.sm
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    height: '100%',
    paddingVertical: 0
  },
  passwordToggle: {
    padding: spacing.xs
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.xs
  }
});

export default Input;
