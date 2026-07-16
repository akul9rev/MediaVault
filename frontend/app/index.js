import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../src/constants/colors';
import spacing from '../src/constants/spacing';
import typography from '../src/constants/typography';

/**
 * Splash Screen
 * Displays logo, app name, and loading state during session recovery.
 */
export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Ionicons name="lock-closed" size={80} color={colors.primary} />
        <Text style={styles.title}>Media Lock</Text>
        <Text style={styles.subtitle}>Monetize & Secure Your Images</Text>
      </View>
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    marginTop: spacing.md
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs
  },
  loader: {
    marginTop: spacing.xl
  }
});
