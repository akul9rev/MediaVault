import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  Pressable, 
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import mediaService from '../../src/services/mediaService';
import { API_CONFIG } from '../../src/constants/api';

import ScreenWrapper from '../../src/components/ScreenWrapper';
import Button from '../../src/components/Button';
import PriceBadge from '../../src/components/PriceBadge';
import LockedBadge from '../../src/components/LockedBadge';
import ErrorMessage from '../../src/components/ErrorMessage';
import colors from '../../src/constants/colors';
import spacing from '../../src/constants/spacing';
import typography from '../../src/constants/typography';
import OriginalViewerModal from '../../src/components/OriginalViewerModal';

export default function MediaDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, token, restoreSession } = useAuth();

  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // High-res secure original loading state controls
  const [viewOriginal, setViewOriginal] = useState(false);
  const [originalLoading, setOriginalLoading] = useState(false);
  const [originalError, setOriginalError] = useState(false);

  const fetchDetails = async () => {
    try {
      setErrorMsg('');
      const response = await mediaService.getDetails(id);
      // Backend returns: { status: 'success', data: { id, title, description, preview_path, unlock_price, locked, ... } }
      setDetails(response.data);
    } catch (err) {
      setErrorMsg('Failed to load media details.');
      console.error('Error fetching details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUnlock = async () => {
    setUnlocking(true);
    setErrorMsg('');

    try {
      const response = await mediaService.unlockMedia(id);
      
      Alert.alert('Success', 'Media unlocked successfully!', [
        { 
          text: 'OK', 
          onPress: async () => {
            // Instantly sync the user coins balance and reload details
            await restoreSession();
            await fetchDetails();
          } 
        }
      ]);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to unlock media. Please try again.';
      setErrorMsg(message);
      setUnlocking(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Media',
      'Are you sure you want to permanently delete this media listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            setDeleting(true);
            setErrorMsg('');
            try {
              await mediaService.deleteMedia(id);
              Alert.alert('Success', 'Media deleted successfully.', [
                { 
                  text: 'OK', 
                  onPress: () => {
                    // Navigate back to refresh feed automatically via useFocusEffect
                    router.back();
                  } 
                }
              ]);
            } catch (err) {
              const message = err.response?.data?.message || 'Failed to delete media. Please try again.';
              setErrorMsg(message);
              setDeleting(false);
            }
          } 
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <ScreenWrapper style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenWrapper>
    );
  }

  if (!details) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.navHeader}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={styles.errorTitle}>Media Not Found</Text>
          <Text style={styles.errorDesc}>{errorMsg || 'The requested media item could not be retrieved.'}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const formattedDate = details.created_at
    ? new Date(details.created_at).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  // API path for fetching protected high-resolution original image
  const originalUri = `${API_CONFIG.baseUrl}/media/${id}/original`;

  return (
    <ScreenWrapper scrollable style={styles.container}>
      <View style={styles.navHeader}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Media Details</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: details.preview_url }} 
          style={styles.image} 
          resizeMode="cover"
        />
      </View>

      <View style={styles.detailsContent}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{details.title}</Text>
          <LockedBadge locked={details.locked} />
        </View>

        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.metaValue}>Uploaded by {details.owner_name}</Text>
          </View>
          
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.metaValue}>{formattedDate}</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.sectionTitle}>Unlock Price</Text>
          <PriceBadge price={details.unlock_price} style={styles.detailPriceBadge} />
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {details.locked 
            ? 'Unlock this premium image to view its full description and stream the original high-resolution file.'
            : (details.description || 'No description provided.')}
        </Text>

        {errorMsg ? <ErrorMessage message={errorMsg} style={styles.errorAlert} /> : null}

        <View style={styles.actions}>
          {details.locked ? (
            <Button
              title={`Unlock Image for ${details.unlock_price} Coins`}
              onPress={handleUnlock}
              loading={unlocking}
              style={styles.actionBtn}
            />
          ) : (
            <View style={styles.ownerActions}>
              <Button
                title="View Original Image"
                onPress={() => setViewOriginal(true)}
                variant="primary"
                style={styles.actionBtn}
              />
              {user && details && user.id.toString() === details.owner_id?.toString() && (
                <Button
                  title="Delete Media"
                  onPress={handleDelete}
                  variant="secondary"
                  loading={deleting}
                  style={[styles.actionBtn, styles.deleteBtn]}
                />
              )}
            </View>
          )}
        </View>
      </View>
      
      <OriginalViewerModal
        visible={viewOriginal}
        onClose={() => setViewOriginal(false)}
        imageUri={originalUri}
        authToken={token}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    flex: 1
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md
  },
  backBtn: {
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius - 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold
  },
  headerRightPlaceholder: {
    width: 38
  },
  imageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  originalWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  originalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl
  },
  originalOverlayText: {
    color: colors.textPrimary,
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold
  },
  originalErrorText: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    textAlign: 'center'
  },
  retryBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius - 10
  },
  retryText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold
  },
  detailsContent: {
    padding: spacing.xl
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    flex: 1,
    marginRight: spacing.md
  },
  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius - 4,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs
  },
  metaValue: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginLeft: spacing.sm
  },
  priceContainer: {
    marginBottom: spacing.lg
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs
  },
  detailPriceBadge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    lineHeight: 22,
    marginBottom: spacing.xl
  },
  errorAlert: {
    marginBottom: spacing.lg
  },
  actions: {
    marginBottom: spacing.xxl
  },
  actionBtn: {
    width: '100%'
  },
  deleteBtn: {
    marginTop: spacing.md,
    borderColor: colors.danger,
    borderWidth: 1
  },
  ownerActions: {
    width: '100%'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    marginTop: 100
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginTop: spacing.md,
    marginBottom: spacing.xs
  },
  errorDesc: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    textAlign: 'center'
  }
});
