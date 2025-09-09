'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { AuthState, SafeUser as User } from '../types';
import { supabase } from 'api';

interface AuthContextType extends AuthState {
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; session: Session } }
  | { type: 'LOGIN_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SESSION_UPDATED'; payload: Session | null };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.session.access_token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_ERROR':
      return { ...state, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SESSION_UPDATED':
      if (action.payload) {
        return {
          ...state,
          token: action.payload.access_token,
          isAuthenticated: true,
          isLoading: false,
        };
      } else {
        return { ...initialState, isLoading: false };
      }
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Convert Supabase user to our User type
  const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      // Fetch additional user data from our users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', supabaseUser.email)
        .single();

      if (error || !userData) {
        console.error('Error fetching user data:', error);
        console.log('Supabase user email:', supabaseUser.email);
        return null;
      }

      return {
        id: userData.id,
        fullName: userData.full_name,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      };
    } catch (error) {
      console.error('Error converting user:', error);
      return null;
    }
  };

  const login = async (emailOrUsername: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      let email = emailOrUsername;
      
      // Check if the input is a username (not an email)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailOrUsername)) {
        // It's a username, so we need to get the email from our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', emailOrUsername)
          .single();

        if (userError || !userData) {
          console.error('Username lookup error:', userError);
          throw new Error('Invalid username or password');
        }
        
        email = userData.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user && data.session) {
        const user = await convertSupabaseUser(data.user);
        if (user) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, session: data.session },
          });
        } else {
          throw new Error('User data not found');
        }
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR' });
      throw error;
    }
  };

  const register = async (email: string, password: string, userData: Partial<User>) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      // First, sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Create user record in our users table
        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .insert({
            email: authData.user.email!,
            username: userData.username || email.split('@')[0],
            full_name: userData.fullName || null,
            role: userData.role || 'staff',
          })
          .select()
          .single();

        if (userError) {
          throw userError;
        }

        if (authData.session && userRecord) {
          const user: User = {
            id: userRecord.id,
            fullName: userRecord.full_name,
            username: userRecord.username,
            email: userRecord.email,
            role: userRecord.role,
            createdAt: userRecord.created_at,
            updatedAt: userRecord.updated_at,
          };

          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, session: authData.session },
          });
        }
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = await convertSupabaseUser(session.user);
          if (user) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, session },
            });
          }
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          dispatch({ type: 'SESSION_UPDATED', payload: session });
        }
      }
    );

    // Check initial session
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const user = await convertSupabaseUser(session.user);
          if (user) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, session },
            });
          } else {
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error checking initial session:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
