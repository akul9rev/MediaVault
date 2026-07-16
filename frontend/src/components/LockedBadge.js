import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

/**
 * Locked/Unlocked Badge Component
 */
export const LockedBadge = ({ locked = true, style }) => {
  return (
    <View 
      style={[
        styles.badge, 
        locked ? styles.lockedBadge : styles.unlockedBadge,
        style
      ]}
    >
      <Ionicons 
        name={locked ? 'lock-closed' : 'lock-open'} 
        size={12} 
        color={colors.textPrimary} 
        style={styles.icon} 
      />
      <Text style={styles.text}>{locked ? 'LOCKED' : 'UNLOCKED'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius - 8,
    alignSelf: 'flex-start'
  },
  lockedBadge: {
    backgroundColor: colors.danger
  },
  unlockedBadge: {
    backgroundColor: colors.success
  },
  icon: {
    marginRight: 4
  },
  text: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs - 2,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5
  }
});

export default LockedBadge;
