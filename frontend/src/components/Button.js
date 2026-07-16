import React, { useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  Pressable, 
  ActivityIndicator, 
  Animated 
} from 'react-native';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

/**
 * Premium Button Component
 * Supports scale transitions on press, primary/secondary variants, loading states, and disabled locks.
 */
export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false, 
  style 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Trigger smooth shrink effect on press down
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true
    }).start();
  };

  // Trigger scale bounce-back on release
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  const isBtnDisabled = disabled || loading;
  const buttonStyle = [
    styles.baseBtn,
    variant === 'primary' ? styles.primaryBtn : styles.secondaryBtn,
    isBtnDisabled && styles.disabledBtn,
    style
  ];

  const textStyle = [
    styles.baseText,
    variant === 'primary' ? styles.primaryText : styles.secondaryText,
    isBtnDisabled && styles.disabledText
  ];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={isBtnDisabled ? null : onPress}
        onPressIn={isBtnDisabled ? null : handlePressIn}
        onPressOut={isBtnDisabled ? null : handlePressOut}
        style={({ pressed }) => [
          buttonStyle,
          pressed && !isBtnDisabled && styles.pressedState
        ]}
        disabled={isBtnDisabled}
      >
        {loading ? (
          <ActivityIndicator size="small" color={variant === 'primary' ? colors.textPrimary : colors.primary} />
        ) : (
          <Text style={textStyle}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  baseBtn: {
    height: 52,
    borderRadius: spacing.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  primaryBtn: {
    backgroundColor: colors.primary
  },
  secondaryBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  disabledBtn: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
    shadowOpacity: 0,
    elevation: 0
  },
  pressedState: {
    opacity: 0.85
  },
  baseText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold
  },
  primaryText: {
    color: colors.textPrimary
  },
  secondaryText: {
    color: colors.textSecondary
  },
  disabledText: {
    color: colors.placeholder
  }
});

export default Button;
