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
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts';
import { useNotifications } from '../contexts';

// Zod schema for login form validation
const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, 'Email or username is required')
    .refine(
      (value) => {
        // Check if it's a valid email OR a username (at least 2 characters, alphanumeric + underscore)
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
  console.log('isAuthenticated:', isAuthenticated);
  console.log('user:', useAuth().user);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearErrors();
      await login(data.emailOrUsername, data.password);

      showMantineNotification('success', 'Welcome back!', 'You have been successfully logged in.');

    } catch (err: any) {
      console.error('Login error:', err);

      let errorTitle = 'Login Failed';
      let errorMessage = 'An error occurred during login. Please try again.';

      if (err.message?.includes('Invalid login credentials') || err.message?.includes('Invalid username or password')) {
        errorMessage = 'Invalid email/username or password. Please check your credentials and try again.';
      } else if (err.message?.includes('Email not confirmed')) {
        errorTitle = 'Email Not Confirmed';
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
      } else if (err.message?.includes('Too many requests')) {
        errorTitle = 'Too Many Attempts';
        errorMessage = 'Too many login attempts. Please wait a moment before trying again.';
      } else if (err.message?.includes('User data not found')) {
        errorTitle = 'Account Not Found';
        errorMessage = 'User account not found in our system. Please contact support.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      showMantineNotification('error', errorTitle, errorMessage);

      setError('root', {
        type: 'manual',
        message: errorMessage
      });
    }
  };

  return (
      <Container size={480} my={40}>
        <Title ta="center" className="font-extrabold text-4xl text-black bg:dark:text-white">
          Welcome back!
        </Title>
        <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
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
            <Button
              fullWidth
              mt="xl"
              type="submit"  
              loading={isSubmitting}
              radius="md"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </Paper>
         <Text ta="center" size="xs" className='text-gray-500 bg:dark:text-gray-400' mt="xl">
          © 2025 Hotel Management System. All rights reserved.
        </Text>
      </Container>
   );
}