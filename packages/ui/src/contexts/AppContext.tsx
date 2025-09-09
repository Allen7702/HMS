'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppSettings, Hotel } from '../types/app';

interface AppContextType extends AppSettings {
  updateHotelSettings: (settings: Partial<Hotel>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_HOTEL'; payload: Hotel }
  | { type: 'UPDATE_HOTEL'; payload: Partial<Hotel> }
  | { type: 'CLEAR_SETTINGS' };

const initialState: AppSettings = {
  hotel: null,
  isLoading: true,
};

function appReducer(state: AppSettings, action: AppAction): AppSettings {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_HOTEL':
      return { ...state, hotel: action.payload, isLoading: false };
    
    case 'UPDATE_HOTEL':
      return {
        ...state,
        hotel: state.hotel ? { ...state.hotel, ...action.payload } : null,
      };
    
    case 'CLEAR_SETTINGS':
      return { ...initialState, isLoading: false };
    
    default:
      return state;
  }
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const updateHotelSettings = async (settings: Partial<Hotel>) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/settings/hotel', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update hotel settings');
      }

      const updatedHotel = await response.json();
      dispatch({ type: 'UPDATE_HOTEL', payload: updatedHotel });
    } catch (error) {
      console.error('Error updating hotel settings:', error);
      throw error;
    }
  };

  const refreshSettings = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/settings/hotel', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hotel settings');
      }

      const hotel = await response.json();
      dispatch({ type: 'SET_HOTEL', payload: hotel });
    } catch (error) {
      console.error('Error fetching hotel settings:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        await refreshSettings();
      } catch (error) {
        // Handle error - maybe show a notification
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadSettings();
  }, []);

  const value: AppContextType = {
    ...state,
    updateHotelSettings,
    refreshSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
