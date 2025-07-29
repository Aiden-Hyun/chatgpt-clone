import { useState } from 'react';
import { useErrorStateCombined } from '../../../shared/hooks/error';
import { supabase } from '../../../shared/lib/supabase';

export const useEmailSignin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthError } = useErrorStateCombined({
    autoClear: true,
    autoClearDelay: 5000,
    showAlerts: true,
    logToConsole: true
  });

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Starting signin process for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Signin response:', { data, error });
      console.log('User data:', data?.user);
      console.log('Session data:', data?.session);

      if (error) {
        console.error('Signin error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          details: error
        });
        
        setAuthError(error.message, {
          context: 'email-signin',
          originalError: error,
          email: email
        });
        return { success: false, data: null, error: error.message };
      }

      if (data.user) {
        console.log('Signin successful for user:', data.user.id);
        console.log('User email confirmed:', data.user.email_confirmed_at);
        return { success: true, data, error: null };
      } else {
        console.error('No user data returned from signin');
        return { success: false, data: null, error: 'No user data returned' };
      }
    } catch (error) {
      console.error('Unexpected signin error:', error);
      setAuthError('An unexpected error occurred during signin', {
        context: 'email-signin',
        originalError: error,
        email: email
      });
      return { success: false, data: null, error: 'Unexpected error' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
  };
}; 