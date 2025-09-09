'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { RootProvider } from 'ui';

// Custom theme for admin dashboard
const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  fontFamilyMonospace: 'var(--font-geist-mono), Monaco, Courier, monospace',
  colors: {
    // Custom color palette for hotel management
    brand: [
      '#f0f9ff',
      '#e0f2fe',
      '#bae6fd',
      '#7dd3fc',
      '#38bdf8',
      '#0ea5e9',
      '#0284c7',
      '#0369a1',
      '#075985',
      '#0c4a6e',
    ],
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <MantineProvider theme={theme}>
      <RootProvider>
        {children}
      </RootProvider>
    </MantineProvider>
  );
}
