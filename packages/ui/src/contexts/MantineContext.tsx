'use client';

import React, { ReactNode } from 'react';
import { Notifications } from '@mantine/notifications';
import { DatesProvider } from '@mantine/dates';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationContext';
import { AppProvider } from './AppContext';
import { HotelProvider } from './HotelContext';
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.locale('en');
interface RootProviderProps {
  children: ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <ThemeProvider>
      <DatesProvider settings={{ locale: 'en', firstDayOfWeek: 0, weekendDays: [0, 6] }}>
        <Notifications position="bottom-right" />
        <AuthProvider>
          <AppProvider>
            <NotificationProvider>
              <HotelProvider>
                {children}
              </HotelProvider>
            </NotificationProvider>
          </AppProvider>
        </AuthProvider>
      </DatesProvider>
    </ThemeProvider>
  );
}