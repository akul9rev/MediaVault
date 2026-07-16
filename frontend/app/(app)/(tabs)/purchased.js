import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Pressable 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
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

export default function PurchasedMediaScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [purchasedList, setPurchasedList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPurchased = async () => {
    try {
      setErrorMsg('');
      const response = await mediaService.getPurchasedMedia(user.id);
      // Backend returns list of purchased items
      setPurchasedList(response.data || []);
    } catch (err) {
      setErrorMsg('Failed to load purchased media.');
      console.error('Purchased media error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPurchased();
  };

  useFocusEffect(
    useCallback(() => {
      fetchPurchased();
    }, [])
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.screenTitle}>Unlocked Media</Text>
      <Text style={styles.subtitle}>All your unlocked premium images in one place</Text>
      {errorMsg ? <ErrorMessage message={errorMsg} style={styles.errorAlert} /> : null}
    </View>
  );

  const renderItem = ({ item }) => {
    // Re-bind locked state to false since they are purchased/unlocked
    const itemData = {
      ...item,
      locked: false
    };
    return <MediaCard item={itemData} />;
  };

  if (isLoading) {
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
        data={purchasedList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading && (
            <EmptyState 
              icon="lock-open-outline" 
              title="No Unlocked Images" 
              description="Unlock premium media from the Home feed to view them here." 
            />
          )
        }
        contentContainerStyle={styles.listContainer}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
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
    paddingBottom: spacing.xxl
  },
  listPadding: {
    paddingHorizontal: spacing.xl
  },
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.md
  },
  screenTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md
  },
  errorAlert: {
    marginVertical: spacing.xs
  }
});
