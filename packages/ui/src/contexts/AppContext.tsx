'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppSettings, Hotel } from '../types/app';
import { HotelAPI, SupabaseError, ValidationError } from 'api';

interface AppContextType extends AppSettings {
  updateHotelSettings: (settings: Partial<Hotel>) => Promise<void>;
  refreshSettings: () => Promise<void>;
  createHotelSettings: (hotelData: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
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
      // Get the current hotel first
      const currentHotel = await HotelAPI.getHotelSettings();
      if (!currentHotel) {
        throw new Error('Hotel not found');
      }

      const updatedHotel = await HotelAPI.updateHotelSettings(currentHotel.id, settings);
      dispatch({ type: 'UPDATE_HOTEL', payload: updatedHotel });
    } catch (error) {
      console.error('Error updating hotel settings:', error);
      
      if (error instanceof ValidationError) {
        throw new Error(`Validation failed: ${error.validationErrors.message}`);
      }
      
      if (error instanceof SupabaseError) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      throw error;
    }
  };

  const refreshSettings = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const hotel = await HotelAPI.getHotelSettings();
      
      if (hotel) {
        dispatch({ type: 'SET_HOTEL', payload: hotel });
      } else {
        // No hotel settings found - this is expected for new installations
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error fetching hotel settings:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      
      if (error instanceof SupabaseError) {
        console.error('Database error:', error.message);
      }
      
      throw error;
    }
  };

  const createHotelSettings = async (hotelData: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newHotel = await HotelAPI.createHotel(hotelData);
      dispatch({ type: 'SET_HOTEL', payload: newHotel });
    } catch (error) {
      console.error('Error creating hotel settings:', error);
      
      if (error instanceof ValidationError) {
        throw new Error(`Validation failed: ${error.validationErrors.message}`);
      }
      
      if (error instanceof SupabaseError) {
        throw new Error(`Database error: ${error.message}`);
      }
      
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
    createHotelSettings,
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
