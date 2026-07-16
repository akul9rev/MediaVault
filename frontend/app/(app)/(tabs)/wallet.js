import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  Pressable 
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/context/AuthContext';
import walletService from '../../../src/services/walletService';

import ScreenWrapper from '../../../src/components/ScreenWrapper';
import EmptyState from '../../../src/components/EmptyState';
import ErrorMessage from '../../../src/components/ErrorMessage';
import colors from '../../../src/constants/colors';
import spacing from '../../../src/constants/spacing';
import typography from '../../../src/constants/typography';

export default function WalletScreen() {
  const { user, restoreSession } = useAuth();
  
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setErrorMsg('');
      const [txResponse] = await Promise.all([
        walletService.getTransactions(),
        restoreSession() // Sync latest wallet balance
      ]);
      // Backend returns: { status: 'success', results: X, data: [ { amount, type, description, created_at } ] }
      setTransactions(txResponse.data || []);
    } catch (err) {
      setErrorMsg('Failed to load transaction history.');
      console.error('Wallet error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.screenTitle}>My Wallet</Text>
      
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <View style={styles.balanceValueRow}>
          <Ionicons name="logo-yen" size={32} color={colors.textPrimary} style={styles.coinIcon} />
          <Text style={styles.balanceValue}>{user?.wallet_balance !== undefined ? user.wallet_balance : 0}</Text>
          <Text style={styles.coinSuffix}> Coins</Text>
        </View>
      </View>

      {errorMsg ? <ErrorMessage message={errorMsg} style={styles.errorAlert} /> : null}
      
      <Text style={styles.historyTitle}>Transaction History</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const isCredit = item.amount >= 0;
    const dateStr = item.created_at
      ? new Date(item.created_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';

    // Choose icon based on transaction type
    let iconName = 'swap-horizontal';
    if (item.type === 'SIGNUP') iconName = 'gift-outline';
    else if (item.type === 'PURCHASE') iconName = 'arrow-down-circle-outline';
    else if (item.type === 'EARNING') iconName = 'arrow-up-circle-outline';

    return (
      <View style={styles.txCard}>
        <View style={styles.txLeft}>
          <View style={[styles.txIconBg, isCredit ? styles.creditIconBg : styles.debitIconBg]}>
            <Ionicons 
              name={iconName} 
              size={20} 
              color={isCredit ? colors.success : colors.danger} 
            />
          </View>
          <View style={styles.txDetails}>
            <Text style={styles.txDescription} numberOfLines={1}>{item.description}</Text>
            <Text style={styles.txDate}>{dateStr}</Text>
          </View>
        </View>
        <Text style={[styles.txAmount, isCredit ? styles.creditText : styles.debitText]}>
          {isCredit ? '+' : ''}{item.amount}
        </Text>
      </View>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonTx} />
      <View style={styles.skeletonTx} />
      <View style={styles.skeletonTx} />
    </View>
  );

  return (
    <ScreenWrapper style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading && (
            <EmptyState 
              icon="receipt-outline" 
              title="No Transactions" 
              description="Your wallet history will appear here once you perform actions." 
            />
          )
        }
        contentContainerStyle={styles.listContainer}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        showsVerticalScrollIndicator={false}
      />
      {isLoading && renderSkeleton()}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  listContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl
  },
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.md
  },
  screenTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.lg
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs
  },
  balanceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  coinIcon: {
    marginRight: spacing.sm,
    alignSelf: 'center'
  },
  balanceValue: {
    color: colors.textPrimary,
    fontSize: 38,
    fontWeight: typography.weights.bold
  },
  coinSuffix: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium
  },
  errorAlert: {
    marginBottom: spacing.md
  },
  historyTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginTop: spacing.sm,
    marginBottom: spacing.sm
  },
  txCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius - 4,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md
  },
  txIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center'
  },
  creditIconBg: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)'
  },
  debitIconBg: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)'
  },
  txDetails: {
    marginLeft: spacing.md,
    flex: 1
  },
  txDescription: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold
  },
  txDate: {
    color: colors.placeholder,
    fontSize: typography.sizes.xs,
    marginTop: 2
  },
  txAmount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold
  },
  creditText: {
    color: colors.success
  },
  debitText: {
    color: colors.danger
  },
  skeletonContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm
  },
  skeletonTx: {
    height: 60,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius - 4,
    marginBottom: spacing.sm,
    opacity: 0.4
  }
});
