import { Logger } from '../../../service/shared/utils/Logger';
import { UserSession , ISessionRepository , User , IUserRepository } from '../../interfaces';




export class SocialAuthUseCase {
  constructor(
    private userRepository: IUserRepository,
    private sessionRepository: ISessionRepository
  ) {}

  async execute(request: SocialAuthRequest): Promise<SocialAuthResult> {
    try {
      Logger.info('SocialAuthUseCase: Starting social authentication', { 
        provider: request.provider 
      });

      // Validate provider
      const validationResult = this.validateProvider(request.provider);
      if (!validationResult.isValid) {
        Logger.warn('SocialAuthUseCase: Invalid provider', { 
          provider: request.provider,
          error: validationResult.error 
        });
        return {
          success: false,
          error: validationResult.error
        };
      }

      // Initiate social auth via repository
      const authResult = await this.userRepository.authenticateWithProvider(request.provider, {
        redirectUrl: request.redirectUrl,
        scopes: request.scopes
      });

      if (!authResult.success) {
        Logger.warn('SocialAuthUseCase: Social authentication failed', { 
          provider: request.provider,
          error: authResult.error 
        });
        return {
          success: false,
          error: authResult.error || 'Social authentication failed',
          isNetworkError: authResult.isNetworkError
        };
      }

      // Process successful auth result
      if (authResult.user && authResult.session) {
        Logger.info('SocialAuthUseCase: Social authentication successful', { 
          provider: request.provider,
          userId: authResult.user.id 
        });

        // Create UserSession from auth result
        const userSession = this.createUserSession(authResult.user, authResult.session);

        // Save session to repository
        const saveResult = await this.sessionRepository.save(userSession);
        if (!saveResult.success) {
          Logger.error('SocialAuthUseCase: Failed to save session after social auth', { 
            error: saveResult.error 
          });
          return {
            success: false,
            error: 'Failed to save authentication session'
          };
        }

        return {
          success: true,
          user: authResult.user,
          session: userSession,
          providerData: authResult.providerData
        };
      } else if (authResult.requiresAdditionalInfo) {
        Logger.info('SocialAuthUseCase: Social auth requires additional information', { 
          provider: request.provider 
        });
        
        return {
          success: false,
          requiresAdditionalInfo: true,
          error: 'Additional information required to complete registration',
          providerData: authResult.providerData
        };
      } else {
        Logger.warn('SocialAuthUseCase: Social auth succeeded but missing user data', { 
          provider: request.provider 
        });
        
        return {
          success: false,
          error: 'Authentication succeeded but user data is incomplete'
        };
      }

    } catch (error) {
      Logger.error('SocialAuthUseCase: Social authentication failed', { 
        error,
        provider: request.provider 
      });
      
      return {
        success: false,
        error: 'Social authentication failed',
        isNetworkError: true
      };
    }
  }

  /**
   * Complete social auth with additional user information
   */
  async completeWithAdditionalInfo(
    provider: AuthProvider,
    providerData: {
      displayName?: string;
      email?: string;
      [key: string]: unknown;
    },
    additionalInfo: {
      displayName?: string;
      acceptTerms: boolean;
    }
  ): Promise<SocialAuthResult> {
    try {
      Logger.info('SocialAuthUseCase: Completing social auth with additional info', { 
        provider 
      });

      // Validate additional info
      if (!additionalInfo.acceptTerms) {
        return {
          success: false,
          error: 'You must accept the terms and conditions to continue'
        };
      }

      // Complete registration with provider data
      const completeResult = await this.userRepository.completeSocialAuth(provider, {
        ...providerData,
        displayName: additionalInfo.displayName || providerData.displayName,
        acceptTerms: additionalInfo.acceptTerms
      });

      if (completeResult.success && completeResult.user && completeResult.session) {
        // Create and save session
        const userSession = this.createUserSession(completeResult.user, completeResult.session);
        
        const saveResult = await this.sessionRepository.save(userSession);
        if (!saveResult.success) {
          Logger.error('SocialAuthUseCase: Failed to save session after completing social auth', { 
            error: saveResult.error 
          });
          return {
            success: false,
            error: 'Failed to save authentication session'
          };
        }

        Logger.info('SocialAuthUseCase: Social auth completed successfully', { 
          provider,
          userId: completeResult.user.id 
        });

        return {
          success: true,
          user: completeResult.user,
          session: userSession
        };
      } else {
        return {
          success: false,
          error: completeResult.error || 'Failed to complete social authentication'
        };
      }

    } catch (error) {
      Logger.error('SocialAuthUseCase: Failed to complete social auth', { error, provider });
      return {
        success: false,
        error: 'Failed to complete social authentication'
      };
    }
  }

  /**
   * Get available social auth providers
   */
  getAvailableProviders(): AuthProvider[] {
    return ['google', 'apple', 'github', 'facebook'];
  }

  /**
   * Check if provider is supported
   */
  isProviderSupported(provider: string): boolean {
    return this.getAvailableProviders().includes(provider as AuthProvider);
  }

  /**
   * Validate auth provider
   */
  private validateProvider(provider: AuthProvider): {
    isValid: boolean;
    error?: string;
  } {
    if (!provider) {
      return {
        isValid: false,
        error: 'Authentication provider is required'
      };
    }

    if (!this.isProviderSupported(provider)) {
      return {
        isValid: false,
        error: `Authentication provider '${provider}' is not supported`
      };
    }

    return { isValid: true };
  }

  /**
   * Create UserSession from auth result
   */
  private createUserSession(user: User, authSession: {
    refresh_token?: string;
    access_token?: string;
  }): UserSession {
    const now = new Date();
    const expiryTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    return new UserSession(
      user.id,
      true,
      user.permissions || ['user'],
      now,
      expiryTime,
      authSession.refresh_token || '',
      authSession.access_token || ''
    );
  }

  /**
   * Get provider display name
   */
  getProviderDisplayName(provider: AuthProvider): string {
    const displayNames: Record<AuthProvider, string> = {
      google: 'Google',
      apple: 'Apple',
      github: 'GitHub',
      facebook: 'Facebook'
    };

    return displayNames[provider] || provider;
  }

  /**
   * Get provider icon/color information
   */
  getProviderInfo(provider: AuthProvider): {
    displayName: string;
    iconName: string;
    color: string;
  } {
    const providerInfo: Record<AuthProvider, { displayName: string; iconName: string; color: string }> = {
      google: {
        displayName: 'Google',
        iconName: 'google',
        color: '#4285F4'
      },
      apple: {
        displayName: 'Apple',
        iconName: 'apple',
        color: '#000000'
      },
      github: {
        displayName: 'GitHub',
        iconName: 'github',
        color: '#333333'
      },
      facebook: {
        displayName: 'Facebook',
        iconName: 'facebook',
        color: '#1877F2'
      }
    };

    return providerInfo[provider] || {
      displayName: provider,
      iconName: 'user',
      color: '#666666'
    };
  }
}
