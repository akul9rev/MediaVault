import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../src/context/AuthContext';

import ScreenWrapper from '../../src/components/ScreenWrapper';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import ErrorMessage from '../../src/components/ErrorMessage';
import colors from '../../src/constants/colors';
import spacing from '../../src/constants/spacing';
import typography from '../../src/constants/typography';

// Define registration validation schema
const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    setErrorMsg('');
    setLoading(true);

    try {
      await register(data.name, data.email, data.password);
      
      // Notify user of successful registration
      Alert.alert(
        'Success',
        'Your account has been created successfully! You can now log in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMsg(serverMessage);
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register to start uploading premium images</Text>
      </View>

      <View style={styles.form}>
        <ErrorMessage message={errorMsg} />

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Full Name"
              placeholder="John Doe"
              icon="person-outline"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Email Address"
              placeholder="name@example.com"
              icon="mail-outline"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={error?.message}
              keyboardType="email-address"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Password"
              placeholder="At least 8 characters"
              icon="lock-closed-outline"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              icon="lock-closed-outline"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={error?.message}
            />
          )}
        />

        <Button
          title="Sign Up"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submitBtn}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.loginText}>Sign In</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xxl,
    justifyContent: 'center',
    paddingTop: spacing.xxl
  },
  header: {
    marginBottom: spacing.xxl,
    marginTop: spacing.sm
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    textAlign: 'center'
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginTop: spacing.sm
  },
  form: {
    flex: 1,
    width: '100%',
    marginBottom: spacing.xl
  },
  submitBtn: {
    marginTop: spacing.xl
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm
  },
  loginText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold
  }
});
