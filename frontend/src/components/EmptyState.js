import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

/**
 * Reusable Empty State Component
 */
export const EmptyState = ({ 
  icon = 'images-outline', 
  title = 'No Media Found', 
  description = 'There are no active media posts available yet.', 
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon} size={64} color={colors.placeholder} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    marginVertical: spacing.xxl
  },
  icon: {
    marginBottom: spacing.md
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
    textAlign: 'center'
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20
  }
});

export default EmptyState;
