import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  Pressable 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/context/AuthContext';
import mediaService from '../../../src/services/mediaService';

import ScreenWrapper from '../../../src/components/ScreenWrapper';
import MediaCard from '../../../src/components/MediaCard';
import SkeletonCard from '../../../src/components/SkeletonCard';
import EmptyState from '../../../src/components/EmptyState';
import ErrorMessage from '../../../src/components/ErrorMessage';
import colors from '../../../src/constants/colors';
import spacing from '../../../src/constants/spacing';
import typography from '../../../src/constants/typography';

export default function HomeFeedScreen() {
  const router = useRouter();
  const { user, logout, restoreSession } = useAuth();
  const flatListRef = useRef(null);

  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch feed page content
  const fetchFeed = async (pageNum, refresh = false) => {
    try {
      setErrorMsg('');
      const limit = 5; // Use 5 for fast visible pagination test
      const response = await mediaService.getFeed(pageNum, limit);
      // Backend returns: { status: 'success', results: X, data: [ ... ] }
      const newItems = response.data || [];

      if (refresh) {
        setFeed(newItems);
        setHasMore(newItems.length === limit);
        // Scroll list to the top to highlight newly uploaded item
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
      } else {
        setFeed((prev) => {
          // Avoid duplicate items
          const existingIds = new Set(prev.map(i => i.id));
          const uniqueNewItems = newItems.filter(i => !existingIds.has(i.id));
          return [...prev, ...uniqueNewItems];
        });
        setHasMore(newItems.length === limit);
      }
    } catch (err) {
      setErrorMsg('Failed to load feed items. Please swipe down to retry.');
      console.error('Error fetching feed:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsFetchingNext(false);
    }
  };

  // Pull to refresh trigger
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    await Promise.all([
      restoreSession(), // Fetch latest user details (coins balance)
      fetchFeed(1, true)
    ]);
  };

  // Infinite Scroll: fetch next page when scrolled near bottom
  const handleLoadMore = () => {
    if (isFetchingNext || !hasMore || isLoading) return;

    setIsFetchingNext(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage);
  };

  // Automatically refresh feed when screen is focused (e.g. returning from upload screen)
  useFocusEffect(
    useCallback(() => {
      // Restore user state (latest balance updates) and fetch feed
      restoreSession();
      fetchFeed(1, true);
      setPage(1);
    }, [])
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.profileSection}>
        <View>
          <Text style={styles.welcomeText}>Hello, {user?.name || 'User'}</Text>
          <View style={styles.coinBadge}>
            <Ionicons name="logo-yen" size={12} color={colors.textPrimary} style={styles.coinIcon} />
            <Text style={styles.coinText}>{user?.wallet_balance !== undefined ? user.wallet_balance : 0} Coins</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <Pressable 
            style={styles.uploadBtn} 
            onPress={() => router.push('/(app)/upload')}
          >
            <Ionicons name="cloud-upload" size={24} color={colors.textPrimary} />
          </Pressable>
          <Pressable 
            style={styles.logoutIcon} 
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.danger} />
          </Pressable>
        </View>
      </View>
      {errorMsg ? <ErrorMessage message={errorMsg} style={styles.errorAlert} /> : null}
      <Text style={styles.feedTitle}>Premium Feed</Text>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNext) return <View style={styles.footerSpacing} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderItem = ({ item }) => <MediaCard item={item} />;

  if (isLoading && page === 1) {
    return (
      <ScreenWrapper style={styles.container}>
        {renderHeader()}
        <View style={styles.listPadding}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={feed}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !isLoading && <EmptyState icon="images-outline" title="Feed is Empty" description="Be the first to upload a locked media file!" />
        }
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  listContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 96
  },
  listPadding: {
    paddingHorizontal: spacing.xl
  },
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.md
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md
  },
  welcomeText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs
  },
  coinBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius - 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start'
  },
  coinIcon: {
    marginRight: 4
  },
  coinText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  uploadBtn: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: spacing.borderRadius - 8,
    marginRight: spacing.sm
  },
  logoutIcon: {
    backgroundColor: colors.card,
    padding: spacing.sm,
    borderRadius: spacing.borderRadius - 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  feedTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginTop: spacing.sm,
    marginBottom: spacing.xs
  },
  errorAlert: {
    marginVertical: spacing.xs
  },
  footerLoader: {
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center'
  },
  footerSpacing: {
    height: spacing.xxl
  }
});
