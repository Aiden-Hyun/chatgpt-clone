import { useState } from 'react';
import { useErrorStateCombined } from '../../../shared/hooks/error';
import { supabase } from '../../../shared/lib/supabase';

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthError } = useErrorStateCombined({
    autoClear: true,
    autoClearDelay: 5000,
    showAlerts: true,
    logToConsole: true
  });

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setAuthError(error.message, {
          context: 'password-reset',
          originalError: error,
          email: email
        });
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      setAuthError('An unexpected error occurred during password reset', {
        context: 'password-reset',
        originalError: error,
        email: email
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    resetPassword,
    isLoading,
  };
}; 