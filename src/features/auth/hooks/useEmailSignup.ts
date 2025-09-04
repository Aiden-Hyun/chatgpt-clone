import type { AuthResponse } from '@supabase/supabase-js';

import { useAuthOperation } from '../../../shared/hooks/useAuthOperation';
import { supabase } from '../../../shared/lib/supabase';

interface SignUpParams {
  email: string;
  password: string;
}

export const useEmailSignup = () => {
  const { execute, isLoading } = useAuthOperation<SignUpParams, AuthResponse['data']>({
    operation: async ({ email, password }) => {
      console.log('Starting signup process for:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }
      
      return data;
    },
    onError: (error) => {
      console.error('Unexpected signup error:', error);
    }
  });

  const signUp = async (email: string, password: string) => {
    return execute({ email, password });
  };

  return {
    signUp,
    isLoading,
  };
}; 