import { useState } from 'react';

import { supabase } from '../../../shared/lib/supabase';

export const useEmailSignin = () => {
  const [isLoading, setIsLoading] = useState(false);


  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
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
        // Check if this is a network error
        const isNetworkError = error.message?.toLowerCase().includes('network') ||
                              error.message?.toLowerCase().includes('fetch') ||
                              error.message?.toLowerCase().includes('connection') ||
                              error.message?.toLowerCase().includes('timeout') ||
                              !navigator.onLine; // Browser offline detection

        return { 
          success: false, 
          data: null, 
          error: error.message,
          isNetworkError 
        };
      }

      if (data.user) {
        if (__DEV__) {
          console.log('Signin successful for user:', data.user.id);
        }
        return { success: true, data, error: null };
      } else {
        return { success: false, data: null, error: 'No user data returned' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unexpected error';
      
      // Check if this is a network error in the catch block
      const isNetworkError = errorMessage.toLowerCase().includes('network') ||
                            errorMessage.toLowerCase().includes('fetch') ||
                            errorMessage.toLowerCase().includes('connection') ||
                            errorMessage.toLowerCase().includes('timeout') ||
                            !navigator.onLine;

      return { 
        success: false, 
        data: null, 
        error: errorMessage,
        isNetworkError 
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
  };
}; 