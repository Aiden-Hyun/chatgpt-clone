import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../../../service/shared/lib/supabase';

/**
 * Hook for handling user logout functionality
 * Centralizes logout logic and provides loading state
 */
export const useLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
          
          if (__DEV__) {
            console.log('🧹 [LOGOUT] Cleared Supabase localStorage items:', keysToRemove);
          }
        } catch (error) {
          console.warn('Failed to clear localStorage:', error);
        }
      }
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Navigate to login screen
      router.replace('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, try to navigate to login
      router.replace('/auth');
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  return {
    logout,
    isLoggingOut,
  };
}; 