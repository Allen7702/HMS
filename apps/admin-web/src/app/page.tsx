'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoader, useAuth } from 'ui';
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

  if (isLoading) {
    return (
      <PageLoader />
    );
  }

  return null;
}
