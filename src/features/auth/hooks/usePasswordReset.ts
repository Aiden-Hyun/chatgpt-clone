import { useState } from 'react';
import { supabase } from '../../../shared/lib/supabase';

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // This should be your app's URL to handle the password reset
        // redirectTo: 'yourapp://auth/reset-password',
      });

      if (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected password reset error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    resetPassword,
    isLoading,
  };
}; 