'use client';

import React, { ReactNode } from 'react';
import { Notifications } from '@mantine/notifications';
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
      <Notifications position="top-right" />
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

// Export all context hooks for convenience
export { useAuth } from './AuthContext';
export { useTheme } from './ThemeContext';
export { useNotifications } from './NotificationContext';
export { useApp } from './AppContext';
export { useWebSocket, useWebSocketSubscription } from './WebSocketContext';
export { useHotel } from './HotelContext';

// Export all providers individually if needed
export { ThemeProvider } from './ThemeContext';
export { AuthProvider } from './AuthContext';
export { NotificationProvider } from './NotificationContext';
export { AppProvider } from './AppContext';
export { WebSocketProvider } from './WebSocketContext';
export { HotelProvider } from './HotelContext';

// Export types
export type { SafeUser as User, AuthState } from '../types';
export type { NotificationItem, AppNotificationState } from '../types';
export type { Hotel, AppSettings } from '../types/app';
export type { Room, RoomType, Guest, Booking } from '../types';
