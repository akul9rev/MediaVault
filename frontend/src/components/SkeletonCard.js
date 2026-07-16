import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import colors from '../constants/colors';
import spacing from '../constants/spacing';

/**
 * Premium Shimmering Skeleton Loader Card
 */
export const SkeletonCard = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Shimmer/Fade loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true
        })
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.imagePlaceholder} />
      <View style={styles.content}>
        <View style={styles.titlePlaceholder} />
        <View style={styles.row}>
          <View style={styles.ownerPlaceholder} />
          <View style={styles.badgePlaceholder} />
        </View>
      </View>
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
    borderColor: colors.border
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: colors.card
  },
  content: {
    padding: spacing.md
  },
  titlePlaceholder: {
    height: 18,
    backgroundColor: colors.card,
    borderRadius: 4,
    width: '70%',
    marginBottom: spacing.sm
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs
  },
  ownerPlaceholder: {
    height: 12,
    backgroundColor: colors.card,
    borderRadius: 4,
    width: '40%'
  },
  badgePlaceholder: {
    height: 20,
    backgroundColor: colors.card,
    borderRadius: 6,
    width: '25%'
  }
});

export default SkeletonCard;
