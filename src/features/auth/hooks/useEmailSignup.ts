import { useState } from 'react';
import { useErrorStateCombined } from '../../../shared/hooks/error';
import { supabase } from '../../../shared/lib/supabase';

export const useEmailSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthError, clearError } = useErrorStateCombined({
    autoClear: true,
    autoClearDelay: 5000,
    showAlerts: true,
    logToConsole: true
  });

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Starting signup process for:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // For development: Disable email confirmation in Supabase dashboard
          // Go to Authentication > Settings > Disable "Enable email confirmations"
          // For production: Configure proper email redirect URLs
        },
      });

      console.log('Signup response:', { data, error });
      console.log('User data:', data?.user);
      console.log('Session data:', data?.session);
      console.log('Email confirmation sent:', data?.user?.confirmation_sent_at);

      if (error) {
        console.error('Signup error:', error);
        setAuthError(error.message, {
          context: 'email-signup',
          originalError: error,
          email: email
        });
        return { success: false, data: null, error: error.message };
      }

      // Check if user was created successfully
      if (data.user) {
        console.log('User created successfully:', data.user.id);
        console.log('User email confirmed:', data.user.email_confirmed_at);
        console.log('Confirmation email sent at:', data.user.confirmation_sent_at);
        
        // Check if email confirmation is required
        if (!data.user.email_confirmed_at) {
          console.log('Email confirmation required - user needs to confirm email');
        } else {
          console.log('Email already confirmed - user can sign in immediately');
        }
        
        return { success: true, data, error: null };
      } else {
        console.error('No user data returned from signup');
        setAuthError('Failed to create account. Please try again.', {
          context: 'email-signup',
          email: email
        });
        return { success: false, data: null, error: 'No user data returned' };
      }
    } catch (error) {
      console.error('Unexpected signup error:', error);
      setAuthError('An unexpected error occurred during signup', {
        context: 'email-signup',
        originalError: error,
        email: email
      });
      return { success: false, data: null, error: 'Unexpected error' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signUp,
    isLoading,
  };
}; 