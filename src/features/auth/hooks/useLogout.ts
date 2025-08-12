import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { supabase } from '../../../shared/lib/supabase';

/**
 * Hook for handling user logout functionality
 * Centralizes logout logic and provides loading state
 */
export const useLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      
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