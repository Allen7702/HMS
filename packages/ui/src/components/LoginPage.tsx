'use client';

import React, { useEffect } from 'react';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Container,
  Box,
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts';
import { useNotifications } from '../contexts';

const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, 'Email or username is required')
    .refine(
      (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9_]{2,}$/;
        return emailRegex.test(value) || usernameRegex.test(value);
      },
      'Please enter a valid email address or username (2+ characters, letters, numbers, and underscores only)'
    ),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginPageProps {
  redirectTo?: string;
  showWelcomeMessage?: boolean;
}

export function LoginPage({ redirectTo, showWelcomeMessage = false }: LoginPageProps) {
  const { login, isAuthenticated } = useAuth();
  const { showMantineNotification } = useNotifications();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const watchedValues = watch();

  useEffect(() => {
    if (errors.root && (watchedValues.emailOrUsername || watchedValues.password)) {
      clearErrors('root');
    }
  }, [watchedValues.emailOrUsername, watchedValues.password, errors.root, clearErrors]);

  useEffect(() => {
    if (isAuthenticated && redirectTo) {
      showMantineNotification('info', 'Already Signed In', 'You are already logged in. Redirecting...');
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, redirectTo, showMantineNotification]);

  useEffect(() => {
    if (showWelcomeMessage) {
      showMantineNotification('info', 'Welcome', 'Please sign in to access your hotel management dashboard.');
    }
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearErrors();
      await login(data.emailOrUsername, data.password);
      showMantineNotification('success', 'Welcome back!', 'You have been successfully logged in.');

    } catch (err: any) {
      console.error('Login error:', err);
      let errorTitle = 'Login Failed';
      showMantineNotification('error', errorTitle, err);
      setError('root', {
        type: 'manual',
        message: err
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Container size={480} py={40}>
        <Title ta="center" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>
          Welcome back!
        </Title>
        <Paper withBorder shadow="sm" p={30} radius="md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              label="Email or Username"
              placeholder="Enter your email or username"
              {...register('emailOrUsername')}
              error={errors.emailOrUsername?.message}
              required
              radius="md"
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              {...register('password')}
              error={errors.password?.message}
              required
              mt="md"
              radius="md"
            />
            <Box>
              <Button
                fullWidth
                mt="xl"
                type="submit"
                loading={isSubmitting}
                radius="md"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>

          </form>
        </Paper>
        <Text ta="center" size="xs" mt="xl">
          © 2025 Hotel Management System. All rights reserved.
        </Text>
      </Container>
    </div>
  );
}