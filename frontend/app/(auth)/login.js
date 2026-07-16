import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
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

// Define login form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
});

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setErrorMsg('');
    setLoading(true);

    try {
      await login(data.email, data.password);
      // AuthProvider triggers layout redirection automatically upon token update
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Failed to connect to the server. Please try again.';
      setErrorMsg(serverMessage);
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.subtitleText}>Sign in to lock or monetize your media</Text>
      </View>

      <View style={styles.form}>
        <ErrorMessage message={errorMsg} />

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
              autoComplete="email"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Password"
              placeholder="Enter your password"
              icon="lock-closed-outline"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={error?.message}
              autoComplete="password"
            />
          )}
        />

        <Pressable style={styles.forgotBtn} onPress={() => {}}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </Pressable>

        <Button
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submitBtn}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Pressable onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xxl,
    justifyContent: 'center',
    paddingTop: spacing.xxxl
  },
  header: {
    marginBottom: spacing.xxxl,
    marginTop: spacing.xl
  },
  welcomeText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    textAlign: 'center'
  },
  subtitleText: {
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginVertical: spacing.xs,
    padding: spacing.xs
  },
  forgotText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium
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
  signUpText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold
  }
});
