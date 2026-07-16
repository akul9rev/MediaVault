import React, { useCallback } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/context/AuthContext';

import ScreenWrapper from '../../../src/components/ScreenWrapper';
import Button from '../../../src/components/Button';
import colors from '../../../src/constants/colors';
import spacing from '../../../src/constants/spacing';
import typography from '../../../src/constants/typography';

export default function ProfileScreen() {
  const { user, logout, restoreSession } = useAuth();

  // Sync latest user details (coins balance) on screen focus
  useFocusEffect(
    useCallback(() => {
      restoreSession();
    }, [])
  );

  const handleLogoutPress = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive', 
          onPress: async () => {
            await logout();
          } 
        }
      ]
    );
  };

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>My Profile</Text>
      </View>

      <View style={styles.profileHeaderCard}>
        <Ionicons name="person-circle" size={80} color={colors.primary} style={styles.avatarIcon} />
        <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'N/A'}</Text>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <View style={styles.rowLeft}>
            <Ionicons name="wallet-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>Wallet Balance</Text>
          </View>
          <View style={styles.coinBadge}>
            <Ionicons name="logo-yen" size={12} color={colors.textPrimary} style={styles.coinIcon} />
            <Text style={styles.coinText}>{user?.wallet_balance !== undefined ? user.wallet_balance : 0} Coins</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.rowLeft}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>App Version</Text>
          </View>
          <Text style={styles.rowValue}>1.0.0 (Production)</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.rowLeft}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>System Security</Text>
          </View>
          <Text style={styles.rowValue}>AES-256 / SHA-2</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Log Out"
          variant="secondary"
          onPress={handleLogoutPress}
          style={styles.logoutBtn}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between'
  },
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.md
  },
  screenTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold
  },
  profileHeaderCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.xxl,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2
  },
  avatarIcon: {
    marginBottom: spacing.sm
  },
  userName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: 4
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xxl
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rowLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.md
  },
  rowValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md
  },
  coinBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs - 2,
    borderRadius: spacing.borderRadius - 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  coinIcon: {
    marginRight: spacing.xs
  },
  coinText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold
  },
  footer: {
    marginBottom: spacing.xl
  },
  logoutBtn: {
    width: '100%'
  }
});
