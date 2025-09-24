/**
 * Business Auth Hook
 * Clean interface to business layer auth operations
 * Centralizes business layer access for auth actions
 */

import { useCallback, useState } from 'react';

import { Logger } from '../../../service/shared/utils/Logger';
import { useBusinessContext } from '../../shared/BusinessContextProvider';
import { AuthFormResult, UseBusinessAuthResult } from '../types/auth.types';

/**
 * Hook for business layer auth operations
 * Provides clean interface to sign in, sign up, sign out, and password reset
 */
export function useBusinessAuth(): UseBusinessAuthResult {
  const [isLoading, setIsLoading] = useState(false);
  const { useCaseFactory } = useBusinessContext();

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string): Promise<AuthFormResult> => {
    try {
      setIsLoading(true);
      Logger.info('useBusinessAuth: Starting sign in', { email });

      const signInUseCase = useCaseFactory.createSignInUseCase();
      const result = await signInUseCase.execute({ email, password });

      if (result.success) {
        Logger.info('useBusinessAuth: Sign in successful', { userId: result.user?.id });
        return { success: true };
      } else {
        Logger.warn('useBusinessAuth: Sign in failed', { error: result.error });
        
        // Check if this is a network error
        const isNetworkError = result.error?.toLowerCase().includes('network') ||
                              result.error?.toLowerCase().includes('fetch') ||
                              result.error?.toLowerCase().includes('connection') ||
                              result.error?.toLowerCase().includes('timeout');

        return { 
          success: false, 
          error: result.error || 'Sign in failed',
          isNetworkError 
        };
      }
    } catch (error) {
      Logger.error('useBusinessAuth: Sign in error', { error });
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      
      return { 
        success: false, 
        error: errorMessage,
        isNetworkError: errorMessage.toLowerCase().includes('network')
      };
    } finally {
      setIsLoading(false);
    }
  }, [useCaseFactory]);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (email: string, password: string): Promise<AuthFormResult> => {
    try {
      setIsLoading(true);
      Logger.info('useBusinessAuth: Starting sign up', { email });

      const signUpUseCase = useCaseFactory.createSignUpUseCase();
      const result = await signUpUseCase.execute({ email, password });

      if (result.success) {
        Logger.info('useBusinessAuth: Sign up successful', { userId: result.user?.id });
        return { success: true };
      } else {
        Logger.warn('useBusinessAuth: Sign up failed', { error: result.error });
        
        const isNetworkError = result.error?.toLowerCase().includes('network') ||
                              result.error?.toLowerCase().includes('fetch') ||
                              result.error?.toLowerCase().includes('connection') ||
                              result.error?.toLowerCase().includes('timeout');

        return { 
          success: false, 
          error: result.error || 'Sign up failed',
          isNetworkError 
        };
      }
    } catch (error) {
      Logger.error('useBusinessAuth: Sign up error', { error });
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      
      return { 
        success: false, 
        error: errorMessage,
        isNetworkError: errorMessage.toLowerCase().includes('network')
      };
    } finally {
      setIsLoading(false);
    }
  }, [useCaseFactory]);

  /**
   * Sign out current user
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      Logger.info('useBusinessAuth: Starting sign out');

      const signOutUseCase = useCaseFactory.createSignOutUseCase();
      const result = await signOutUseCase.execute();

      if (result.success) {
        Logger.info('useBusinessAuth: Sign out successful');
      } else {
        Logger.warn('useBusinessAuth: Sign out failed', { error: result.error });
        // Don't throw error for sign out - best effort
      }
    } catch (error) {
      Logger.error('useBusinessAuth: Sign out error', { error });
      // Don't throw error for sign out - best effort
    } finally {
      setIsLoading(false);
    }
  }, [useCaseFactory]);

  /**
   * Request password reset
   */
  const resetPassword = useCallback(async (email: string): Promise<AuthFormResult> => {
    try {
      setIsLoading(true);
      Logger.info('useBusinessAuth: Starting password reset', { email });

      const resetPasswordUseCase = useCaseFactory.createRequestPasswordResetUseCase();
      const result = await resetPasswordUseCase.execute({ email });

      if (result.success) {
        Logger.info('useBusinessAuth: Password reset successful');
        return { success: true };
      } else {
        Logger.warn('useBusinessAuth: Password reset failed', { error: result.error });
        
        const isNetworkError = result.error?.toLowerCase().includes('network') ||
                              result.error?.toLowerCase().includes('fetch') ||
                              result.error?.toLowerCase().includes('connection') ||
                              result.error?.toLowerCase().includes('timeout');

        return { 
          success: false, 
          error: result.error || 'Password reset failed',
          isNetworkError 
        };
      }
    } catch (error) {
      Logger.error('useBusinessAuth: Password reset error', { error });
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      
      return { 
        success: false, 
        error: errorMessage,
        isNetworkError: errorMessage.toLowerCase().includes('network')
      };
    } finally {
      setIsLoading(false);
    }
  }, [useCaseFactory]);

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    isLoading
  };
}
