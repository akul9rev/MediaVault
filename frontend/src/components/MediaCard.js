import React, { useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  Pressable, 
  Animated 
} from 'react-native';
import { useRouter } from 'expo-router';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import LockedBadge from './LockedBadge';
import PriceBadge from './PriceBadge';

/**
 * Reusable Premium Media Card
 * Renders thumbnail previews, locking state banners, and handles click scaling animations.
 */
export const MediaCard = ({ item }) => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  const handlePress = () => {
    // Navigate to dynamic details page app/(app)/[id].js
    router.push({
      pathname: '/(app)/[id]',
      params: { id: item.id }
    });
  };

  const formattedDate = item.created_at 
    ? new Date(item.created_at).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    : '';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.pressedCard
        ]}
      >
        <Image 
          source={{ uri: item.preview_url }} 
          style={styles.image} 
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          
          <View style={styles.metaRow}>
            <View>
              <Text style={styles.ownerText}>By {item.owner_name}</Text>
              {formattedDate ? <Text style={styles.dateText}>{formattedDate}</Text> : null}
            </View>
            
            <View style={styles.badges}>
              <PriceBadge price={item.unlock_price} style={styles.priceBadge} />
              <LockedBadge locked={item.locked} />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3
  },
  pressedCard: {
    opacity: 0.95
  },
  image: {
    height: 220,
    width: '100%',
    backgroundColor: colors.card
  },
  content: {
    padding: spacing.md
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.xs
  },
  ownerText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium
  },
  dateText: {
    color: colors.placeholder,
    fontSize: typography.sizes.xs,
    marginTop: 2
  },
  badges: {
    alignItems: 'flex-end'
  },
  priceBadge: {
    marginBottom: 6
  }
});

export default React.memo(MediaCard);
