import { useCallback, useMemo, useState } from 'react';

import { useToast } from '../../alert/toast';
import { useBusinessContext } from '../../shared/BusinessContextProvider';

/**
 * Hook for handling social authentication using business layer UseCases
 * Provides proper business logic for social login with various providers
 */
export function useSocialAuth() {
  const { useCaseFactory } = useBusinessContext();
  const { showSuccess, showError, showInfo } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Create SocialAuthUseCase once using useMemo
  const socialAuthUseCase = useMemo(() => 
    useCaseFactory.createSocialAuthUseCase(), [useCaseFactory]
  );

  // Authenticate with a social provider
  const authenticateWithProvider = useCallback(async (provider: string, options: {
    redirectUrl?: string;
    scopes?: string[];
  } = {}) => {
    setIsLoading(true);
    
    try {
      showInfo(`Connecting to ${provider}...`);

      const result = await socialAuthUseCase.execute({
        provider,
        redirectUrl: options.redirectUrl || `${window.location.origin}/auth/callback`,
        scopes: options.scopes || []
      });

      if (result.success) {
        showSuccess(`Successfully authenticated with ${provider}`);
        return {
          success: true,
          user: result.user,
          session: result.session,
          providerData: result.providerData
        };
      } else if (result.requiresAdditionalInfo) {
        showInfo('Additional information required to complete registration');
        return {
          success: false,
          requiresAdditionalInfo: true,
          providerData: result.providerData,
          error: result.error
        };
      } else {
        showError(result.error || `Failed to authenticate with ${provider}`);
        return {
          success: false,
          error: result.error,
          isNetworkError: result.isNetworkError
        };
      }
    } catch (error) {
      console.error('Social authentication failed:', error);
      showError(`Failed to authenticate with ${provider}`);
      return {
        success: false,
        error: 'Authentication failed',
        isNetworkError: true
      };
    } finally {
      setIsLoading(false);
    }
  }, [socialAuthUseCase, showSuccess, showError, showInfo]);

  // Authenticate with Google
  const authenticateWithGoogle = useCallback(async (options: {
    redirectUrl?: string;
    scopes?: string[];
  } = {}) => {
    return authenticateWithProvider('google', options);
  }, [authenticateWithProvider]);

  // Authenticate with GitHub
  const authenticateWithGitHub = useCallback(async (options: {
    redirectUrl?: string;
    scopes?: string[];
  } = {}) => {
    return authenticateWithProvider('github', options);
  }, [authenticateWithProvider]);

  // Authenticate with Microsoft
  const authenticateWithMicrosoft = useCallback(async (options: {
    redirectUrl?: string;
    scopes?: string[];
  } = {}) => {
    return authenticateWithProvider('microsoft', options);
  }, [authenticateWithProvider]);

  // Authenticate with Apple
  const authenticateWithApple = useCallback(async (options: {
    redirectUrl?: string;
    scopes?: string[];
  } = {}) => {
    return authenticateWithProvider('apple', options);
  }, [authenticateWithProvider]);

  return {
    authenticateWithProvider,
    authenticateWithGoogle,
    authenticateWithGitHub,
    authenticateWithMicrosoft,
    authenticateWithApple,
    isLoading
  };
}
