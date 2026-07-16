import React, { useState, useRef, useEffect } from 'react';
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
import api from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * High performance manual base64 encoder
 */
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  let base64 = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let i = 0;
  for (; i < len - 2; i += 3) {
    const chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    base64 += chars[(chunk >> 18) & 63];
    base64 += chars[(chunk >> 12) & 63];
    base64 += chars[(chunk >> 6) & 63];
    base64 += chars[chunk & 63];
  }
  if (i === len - 2) {
    const chunk = (bytes[i] << 16) | (bytes[i + 1] << 8);
    base64 += chars[(chunk >> 18) & 63];
    base64 += chars[(chunk >> 12) & 63];
    base64 += chars[(chunk >> 6) & 63];
    base64 += '=';
  } else if (i === len - 1) {
    const chunk = bytes[i] << 16;
    base64 += chars[(chunk >> 18) & 63];
    base64 += chars[(chunk >> 12) & 63];
    base64 += '==';
  }
  return base64;
};

/**
 * Reusable Premium Original Image Zoom Viewer Modal
 * Fetches secure original media over authenticated Axios endpoints and renders base64 data URIs.
 */
export const OriginalViewerModal = ({ 
  visible = false, 
  onClose, 
  imageUri, 
  authToken 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [localUri, setLocalUri] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const lastTapRef = useRef(0);

  // Animated scale value for double-tap zoom transitions
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Manage immersive status bar visibility
  useEffect(() => {
    if (visible) {
      StatusBar.setHidden(true, 'fade');
    } else {
      StatusBar.setHidden(false, 'fade');
    }
    return () => {
      StatusBar.setHidden(false, 'fade');
    };
  }, [visible]);

  // Fetch the secure original image binary and convert to base64
  const fetchSecureImage = async () => {
    if (!imageUri || !visible) return;

    setLoading(true);
    setError(false);
    setLocalUri('');

    try {
      const response = await api.get(imageUri, {
        responseType: 'arraybuffer',
        timeout: 60000, // 60 seconds timeout for high-resolution original images
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const base64Data = arrayBufferToBase64(response.data);
      const mimeType = response.headers['content-type'] || 'image/jpeg';
      const base64Uri = `data:${mimeType};base64,${base64Data}`;

      setLocalUri(base64Uri);
    } catch (err) {
      console.error('Error fetching secure original image:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchSecureImage();
    } else {
      // Clear base64 string on close to free memory
      setLocalUri('');
      setError(false);
      setLoading(false);
      setZoomLevel(1);
      scaleValue.setValue(1);
    }
  }, [visible, imageUri]);

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
    fetchSecureImage();
  };

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
          {localUri ? (
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <Image
                source={{ uri: localUri }}
                style={styles.image}
                resizeMode="contain"
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
