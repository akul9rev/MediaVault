import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

/**
 * Premium Price Badge Component
 */
export const PriceBadge = ({ price = 0, style }) => {
  return (
    <View style={[styles.badge, style]}>
      <Ionicons name="logo-yen" size={12} color={colors.textPrimary} style={styles.icon} />
      <Text style={styles.text}>{price} Coins</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius - 8,
    alignSelf: 'flex-start'
  },
  icon: {
    marginRight: 4
  },
  text: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.bold
  }
});

export default PriceBadge;
