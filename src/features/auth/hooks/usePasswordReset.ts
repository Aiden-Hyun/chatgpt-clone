import { supabase } from '../../../shared/lib/supabase';

import { useAuthOperationVoid } from './useAuthOperation';

interface PasswordResetParams {
  email: string;
}

export const usePasswordReset = () => {
  const { execute, isLoading } = useAuthOperationVoid<PasswordResetParams>({
    operation: async ({ email }) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // This should be your app's URL to handle the password reset
        // redirectTo: 'yourapp://auth/reset-password',
      });

      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }
    },
    onError: (error) => {
      console.error('Unexpected password reset error:', error);
    }
  });

  const resetPassword = async (email: string) => {
    const result = await execute({ email });
    // Convert to the expected format for backward compatibility
    return { 
      success: result.success, 
      error: result.error 
    };
  };

  return {
    resetPassword,
    isLoading,
  };
}; 