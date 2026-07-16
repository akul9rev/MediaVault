import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  Modal, 
  ActivityIndicator, 
  Pressable, 
  Dimensions, 
  Animated, 
  GestureResponderEvent,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Reusable Premium Original Image Zoom Viewer Modal
 * Supports double-tap zoom scaling, loading status, retry buttons, and custom headers.
 */
export const OriginalViewerModal = ({ 
  visible = false, 
  onClose, 
  imageUri, 
  authToken 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const lastTapRef = useRef(0);

  // Manage immersive status bar visibility
  React.useEffect(() => {
    if (visible) {
      StatusBar.setHidden(true, 'fade');
    } else {
      StatusBar.setHidden(false, 'fade');
    }
    return () => {
      StatusBar.setHidden(false, 'fade');
    };
  }, [visible]);

  // Animated scale value for double-tap zoom transitions
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Double tap handler
  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      // Toggle zoom level
      const toValue = zoomLevel === 1 ? 2.5 : 1;
      setZoomLevel(toValue);
      Animated.spring(scaleValue, {
        toValue,
        friction: 7,
        useNativeDriver: true
      }).start();
    }
    lastTapRef.current = now;
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
  };

  // Prevent caching by appending a fresh timestamp to the authorized image URI
  const secureUri = imageUri ? `${imageUri}?t=${Date.now()}` : '';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Original Image Viewer</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <Pressable 
          style={styles.imageContent} 
          onPress={handleTap}
        >
          {secureUri ? (
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <Image
                source={{
                  uri: secureUri,
                  headers: { Authorization: `Bearer ${authToken}` }
                }}
                style={styles.image}
                resizeMode="contain"
                onLoadStart={() => {
                  setLoading(true);
                  setError(false);
                }}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError(true);
                }}
              />
            </Animated.View>
          ) : null}

          {loading && (
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.overlayText}>Loading Secure Original Media...</Text>
            </View>
          )}

          {error && (
            <View style={styles.overlay}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
              <Text style={styles.errorText}>Failed to load original image.</Text>
              <Pressable style={styles.retryBtn} onPress={handleRetry}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.footerText}>Double tap the image to zoom in/out.</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 10
  },
  closeBtn: {
    padding: spacing.xs
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold
  },
  headerRightPlaceholder: {
    width: 32
  },
  imageContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl
  },
  overlayText: {
    color: colors.textPrimary,
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold
  },
  errorText: {
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
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)'
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginLeft: spacing.xs
  }
});

export default OriginalViewerModal;
