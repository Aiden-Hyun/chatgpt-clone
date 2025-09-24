/**
 * Simplified Logout Hook
 * Uses business layer through useBusinessAuth hook
 * Matches /src reference pattern but with business layer
 */

import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

import { useBusinessAuth } from './useBusinessAuth';
import { UseLogoutResult } from '../types/auth.types';

/**
 * Hook for handling user logout functionality
 * Simplified version that matches /src reference implementation
 */
export const useLogout = (): UseLogoutResult => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { signOut } = useBusinessAuth();

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      
      // On web, clear localStorage first to prevent race conditions
      if (Platform.OS === 'web') {
        try {
          // Clear all Supabase-related localStorage items
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
          console.warn('Failed to clear localStorage:', error);
        }
      }
      
      // Sign out using business layer
      await signOut();
      
      // Navigate to login screen
      router.replace('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, try to navigate to login
      router.replace('/auth');
    } finally {
      setIsLoggingOut(false);
    }
  }, [signOut]);

  return {
    logout,
    isLoggingOut,
  };
}; 