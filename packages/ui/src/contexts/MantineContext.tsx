'use client';

import React, { ReactNode } from 'react';
import { Notifications, showNotification } from '@mantine/notifications';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationContext';
import { AppProvider } from './AppContext';
import { WebSocketProvider } from './WebSocketContext';
import { HotelProvider } from './HotelContext';

interface RootProviderProps {
  children: ReactNode;
  websocketUrl?: string;
}

export function RootProvider({ children, websocketUrl }: RootProviderProps) {
  return (
    <ThemeProvider>
      <Notifications position="bottom-right" />
      <AuthProvider>
        <AppProvider>
          <NotificationProvider>
            <HotelProvider>
              {/* <WebSocketProvider url={websocketUrl}> */}
                {children}
              {/* </WebSocketProvider> */}
            </HotelProvider>
          </NotificationProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}