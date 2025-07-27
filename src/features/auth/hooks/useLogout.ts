import { useCallback, useState } from 'react';
import { useNavigation } from '../../../shared/hooks';
import { supabase } from '../../../shared/lib/supabase';

/**
 * Hook for handling user logout functionality
 * Centralizes logout logic and provides loading state
 */
export const useLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { navigateToLogin } = useNavigation();

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Navigate to login screen
      navigateToLogin();
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, try to navigate to login
      navigateToLogin();
    } finally {
      setIsLoggingOut(false);
    }
  }, [navigateToLogin]);

  return {
    logout,
    isLoggingOut,
  };
}; 