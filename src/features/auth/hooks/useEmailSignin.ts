import type { AuthResponse } from '@supabase/supabase-js';

import { useAuthOperation } from '../../../shared/hooks/useAuthOperation';
import { supabase } from '../../../shared/lib/supabase';

interface SignInParams {
  email: string;
  password: string;
}

export const useEmailSignin = () => {
  const { execute, isLoading } = useAuthOperation<SignInParams, AuthResponse['data']>({
    operation: async ({ email, password }) => {
      if (__DEV__) console.log('Starting signin process for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (__DEV__) {
        console.log('Signin response:', { hasUser: !!data?.user, hasSession: !!data?.session, error: !!error });
        console.log('User:', { id: data?.user?.id });
        console.log('Session:', { hasSession: !!data?.session, expires_at: data?.session?.expires_at });
      }

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      return data;
    },
    enableNetworkErrorDetection: true,
    onSuccess: (data) => {
      if (__DEV__) {
        console.log('Signin successful for user:', data.user?.id);
      }
    }
  });

  const signIn = async (email: string, password: string) => {
    return execute({ email, password });
  };

  return {
    signIn,
    isLoading,
  };
}; 