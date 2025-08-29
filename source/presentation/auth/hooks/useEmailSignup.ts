import { useState } from 'react';
import { supabase } from '../../../service/shared/lib/supabase';

export const useEmailSignup = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Starting signup process for:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Signup error:', error);
        return { success: false, data: null, error: error.message };
      }

      if (data.user) {
        return { success: true, data, error: null };
      }
      
      return { success: false, data: null, error: 'No user data returned' };

    } catch (error) {
      console.error('Unexpected signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signUp,
    isLoading,
  };
}; 