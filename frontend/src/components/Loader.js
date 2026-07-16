import React from 'react';
import { StyleSheet, View, ActivityIndicator, Modal, Text, Platform } from 'react-native';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

/**
 * Centered Inline Activity Indicator
 */
export const Loader = ({ size = 'large', color = colors.primary, style }) => (
  <View style={[styles.inlineContainer, style]}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

/**
 * Full Screen Blocking Loader Modal Overlay
 */
export const FullScreenLoader = ({ visible = false, message = 'Loading...' }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.modalBackground}>
      <View style={styles.loaderCard}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message && <Text style={styles.messageText}>{message}</Text>}
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  inlineContainer: {
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBackground: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loaderCard: {
    backgroundColor: colors.surface,
    padding: spacing.xxl,
    borderRadius: spacing.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8
  },
  messageText: {
    color: colors.textPrimary,
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium'
  }
});
