import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  Pressable, 
  Alert, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Ionicons } from '@expo/vector-icons';
import mediaService from '../../../src/services/mediaService';

import ScreenWrapper from '../../../src/components/ScreenWrapper';
import Input from '../../../src/components/Input';
import Button from '../../../src/components/Button';
import ErrorMessage from '../../../src/components/ErrorMessage';
import colors from '../../../src/constants/colors';
import spacing from '../../../src/constants/spacing';
import typography from '../../../src/constants/typography';

// Define upload form validation schema
const uploadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title is too long'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(1000, 'Description is too long'),
  unlock_price: z
    .string()
    .min(1, 'Unlock price is required')
    .refine((val) => {
      const parsed = parseInt(val, 10);
      return !isNaN(parsed) && parsed >= 0;
    }, {
      message: 'Unlock price must be a valid positive coin amount'
    })
});

export default function UploadScreen() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      description: '',
      unlock_price: ''
    }
  });

  // Request photo gallery permission and launch image library picker
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access your gallery is required to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        name: asset.fileName || asset.uri.split('/').pop() || 'upload.jpg',
        type: asset.mimeType || 'image/jpeg'
      });
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Failed to select image. Please try again.');
      console.error('Image picker error:', err);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setUploadProgress(0);
  };

  const onSubmit = async (data) => {
    if (!selectedImage) {
      setErrorMsg('Please select an image to upload.');
      return;
    }

    setErrorMsg('');
    setIsUploading(true);
    setUploadProgress(0);

    // Prepare multipart/form-data payload
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('unlock_price', data.unlock_price);
    
    // Append image file descriptor object
    formData.append('image', {
      uri: selectedImage.uri,
      name: selectedImage.name,
      type: selectedImage.type
    });

    try {
      await mediaService.uploadMedia(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      setIsUploading(false);
      Alert.alert(
        'Success', 
        'Your premium image has been uploaded successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              clearSelectedImage();
              reset();
              // Return to Home screen which automatically re-focuses and refreshes
              router.back();
            } 
          }
        ]
      );
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Failed to upload image. Please try again.';
      setErrorMsg(serverMessage);
      setIsUploading(false);
    }
  };

  return (
    <ScreenWrapper scrollable style={styles.container}>
      <View style={styles.navHeader}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Upload Premium Media</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <View style={styles.form}>
        <ErrorMessage message={errorMsg} />

        <Text style={styles.sectionLabel}>Image File</Text>
        {selectedImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            <Pressable style={styles.removeImageBtn} onPress={clearSelectedImage}>
              <Ionicons name="close-circle" size={28} color={colors.danger} />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.pickerBox} onPress={pickImage}>
            <Ionicons name="image-outline" size={48} color={colors.placeholder} />
            <Text style={styles.pickerBoxText}>Select Image From Gallery</Text>
            <Text style={styles.pickerBoxSubtext}>Supports JPG, PNG, WEBP, and GIF (Max 10MB)</Text>
          </Pressable>
        )}

        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Title"
              placeholder="e.g. Beautiful Mountain Landscape"
              icon="text-outline"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={error?.message}
              editable={!isUploading}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Description"
              placeholder="Provide a detailed description of your premium media..."
              icon="document-text-outline"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={error?.message}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              editable={!isUploading}
            />
          )}
        />

        <Controller
          control={control}
          name="unlock_price"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Unlock Price (Coins)"
              placeholder="e.g. 50"
              icon="logo-yen"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={error?.message}
              keyboardType="number-pad"
              editable={!isUploading}
            />
          )}
        />

        {isUploading && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Uploading: {uploadProgress}%</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.waitMessage}>Please wait while your premium media is uploading. Do not close the app or navigate away.</Text>
            <ActivityIndicator size="small" color={colors.primary} style={styles.progressSpinner} />
          </View>
        )}

        <Button
          title={isUploading ? "Uploading Media..." : "Upload & Lock Media"}
          onPress={handleSubmit(onSubmit)}
          loading={isUploading}
          disabled={!selectedImage || isUploading}
          style={styles.uploadBtn}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
  form: {
    padding: spacing.xl
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs
  },
  pickerBox: {
    height: 180,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.md
  },
  pickerBoxText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.sm
  },
  pickerBoxSubtext: {
    color: colors.placeholder,
    fontSize: typography.sizes.xs,
    marginTop: 4,
    textAlign: 'center'
  },
  previewContainer: {
    height: 220,
    borderRadius: spacing.borderRadius,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  previewImage: {
    width: '100%',
    height: '100%'
  },
  removeImageBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.overlay,
    borderRadius: 14
  },
  textArea: {
    height: 100
  },
  progressContainer: {
    marginVertical: spacing.md,
    alignItems: 'center'
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs
  },
  waitMessage: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 16
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary
  },
  progressSpinner: {
    marginTop: spacing.sm
  },
  uploadBtn: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl
  }
});
