'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'ui';
import { Box, Center, Loader, Stack, Text } from '@mantine/core';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box
        style={(theme) => ({
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.violet[6]} 100%)`,
        })}
      >
        <Center h="100vh">
          <Stack align="center" gap="lg">
            <Loader size="xl" color="white" />
            <Text size="lg" fw={500} c="white">
              Loading your dashboard...
            </Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  return null;
}
