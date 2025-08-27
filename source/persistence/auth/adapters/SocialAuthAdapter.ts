import { SupabaseClient } from '@supabase/supabase-js';
import { ILogger } from '../../../service/shared/interfaces/ILogger';
import { ConfigService, IConfigService } from '../../../service/shared/lib/config';
import { createSupabaseClient } from '../../../service/shared/lib/supabase';
import { Logger } from '../../../service/shared/utils/Logger';

export interface SocialAuthOptions {
  redirectUrl?: string;
  scopes?: string[];
}

export interface SocialAuthAdapterResult {
  success: boolean;
  user?: any;
  session?: any;
  error?: string;
  isNetworkError?: boolean;
  requiresAdditionalInfo?: boolean;
  providerData?: {
    providerId: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

export class SocialAuthAdapter {
  private static readonly SUPPORTED_PROVIDERS = ['google', 'apple', 'github', 'facebook'] as const;
  private readonly logger: ILogger;
  private readonly supabase: SupabaseClient;

  constructor(
    configService: IConfigService = new ConfigService(),
    logger: ILogger = new Logger().child('SocialAuthAdapter'),
    supabase?: SupabaseClient
  ) {
    this.logger = logger;
    this.supabase = supabase || createSupabaseClient(configService);
  }

  /**
   * Authenticate with a social provider
   */
  async authenticateWithProvider(
    provider: string, 
    options: SocialAuthOptions = {}
  ): Promise<SocialAuthAdapterResult> {
    try {
      this.logger.info('Starting authentication', { provider });

      if (!this.isProviderSupported(provider)) {
        return {
          success: false,
          error: `Provider '${provider}' is not supported`
        };
      }

      // Get redirect URL
      const redirectTo = options.redirectUrl || this.getDefaultRedirectUrl();

      // Initiate OAuth flow with Supabase
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo,
          scopes: options.scopes?.join(' '),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        this.logger.error('OAuth initiation failed', { 
          provider, 
          error: error.message 
        });
        
        const isNetworkError = this.isNetworkError(error);
        return {
          success: false,
          error: error.message,
          isNetworkError
        };
      }

      // For OAuth flows, the actual authentication happens via redirect
      // This method initiates the flow, the completion happens in handleOAuthCallback
      this.logger.info('OAuth flow initiated', { provider });
      
      return {
        success: true,
        // OAuth flows don't return user data immediately
        // The user will be redirected and we'll handle the callback
      };

    } catch (error) {
      this.logger.error('Authentication failed', { error, provider });
      return {
        success: false,
        error: 'Social authentication failed',
        isNetworkError: true
      };
    }
  }

  /**
   * Handle OAuth callback after redirect
   */
  async handleOAuthCallback(): Promise<SocialAuthAdapterResult> {
    try {
      this.logger.info('Handling OAuth callback');

      // Get session from URL hash or query params
      const { data, error } = await this.supabase.auth.getSession();

      if (error) {
        this.logger.error('OAuth callback error', { error: error.message });
        return {
          success: false,
          error: error.message,
          isNetworkError: this.isNetworkError(error)
        };
      }

      if (!data.session) {
        this.logger.warn('No session found in OAuth callback');
        return {
          success: false,
          error: 'No authentication session found'
        };
      }

      const { session } = data;
      const user = session.user;

      if (!user) {
        this.logger.warn('No user data in OAuth callback');
        return {
          success: false,
          error: 'No user data found'
        };
      }

      // Extract provider data
      const providerData = this.extractProviderData(user);

      // Check if user needs to complete profile
      const needsAdditionalInfo = this.checkIfAdditionalInfoNeeded(user);

      if (needsAdditionalInfo) {
        this.logger.info('User needs additional information', { 
          userId: user.id 
        });
        
        return {
          success: false,
          requiresAdditionalInfo: true,
          providerData,
          error: 'Additional information required'
        };
      }

      this.logger.info('OAuth authentication successful', { 
        userId: user.id,
        provider: user.app_metadata?.provider 
      });

      return {
        success: true,
        user,
        session,
        providerData
      };

    } catch (error) {
      this.logger.error('OAuth callback handling failed', { error });
      return {
        success: false,
        error: 'Failed to process authentication callback',
        isNetworkError: true
      };
    }
  }

  /**
   * Complete social authentication with additional information
   */
  async completeSocialAuth(provider: string, data: any): Promise<SocialAuthAdapterResult> {
    try {
      this.logger.info('Completing social authentication', { provider });

      // Get current session (should exist from OAuth flow)
      const { data: sessionData, error: sessionError } = await this.supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        return {
          success: false,
          error: 'No active authentication session found'
        };
      }

      const { session } = sessionData;
      const user = session.user;

      // Update user metadata with additional information
      const { error: updateError } = await this.supabase.auth.updateUser({
        data: {
          display_name: data.displayName,
          completed_profile: true,
          terms_accepted: data.acceptTerms,
          profile_completed_at: new Date().toISOString()
        }
      });

      if (updateError) {
        this.logger.error('Failed to update user profile', { 
          error: updateError.message 
        });
        return {
          success: false,
          error: 'Failed to complete profile setup',
          isNetworkError: this.isNetworkError(updateError)
        };
      }

      // Get updated session
      const { data: updatedSessionData } = await this.supabase.auth.getSession();
      const updatedSession = updatedSessionData.session;
      const updatedUser = updatedSession?.user;

      this.logger.info('Social authentication completed', { 
        userId: user.id 
      });

      return {
        success: true,
        user: updatedUser,
        session: updatedSession
      };

    } catch (error) {
      this.logger.error('Failed to complete social auth', { error, provider });
      return {
        success: false,
        error: 'Failed to complete social authentication',
        isNetworkError: true
      };
    }
  }

  /**
   * Get authentication URL for a provider (for manual redirect)
   */
  async getAuthUrl(provider: string, options: SocialAuthOptions = {}): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    try {
      if (!this.isProviderSupported(provider)) {
        return {
          success: false,
          error: `Provider '${provider}' is not supported`
        };
      }

      const redirectTo = options.redirectUrl || this.getDefaultRedirectUrl();

      // This would typically generate the OAuth URL
      // For Supabase, the signInWithOAuth method handles the redirect automatically
      const authUrl = `${this.supabase.supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}`;

      return {
        success: true,
        url: authUrl
      };

    } catch (error) {
      this.logger.error('Failed to generate auth URL', { error, provider });
      return {
        success: false,
        error: 'Failed to generate authentication URL'
      };
    }
  }

  /**
   * Check if provider is supported
   */
  private isProviderSupported(provider: string): boolean {
    return SocialAuthAdapter.SUPPORTED_PROVIDERS.includes(provider as any);
  }

  /**
   * Get default redirect URL
   */
  private getDefaultRedirectUrl(): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }
    return 'http://localhost:3000/auth/callback';
  }

  /**
   * Extract provider data from user object
   */
  private extractProviderData(user: any): {
    providerId: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  } {
    const identities = user.identities || [];
    const primaryIdentity = identities[0] || {};

    return {
      providerId: primaryIdentity.id || user.id,
      email: user.email,
      displayName: user.user_metadata?.full_name || 
                   user.user_metadata?.name || 
                   user.user_metadata?.display_name,
      avatarUrl: user.user_metadata?.avatar_url || 
                 user.user_metadata?.picture
    };
  }

  /**
   * Check if user needs additional information
   */
  private checkIfAdditionalInfoNeeded(user: any): boolean {
    // Check if profile is already completed
    if (user.user_metadata?.completed_profile) {
      return false;
    }

    // Check if required fields are missing
    const hasDisplayName = !!(user.user_metadata?.display_name || 
                             user.user_metadata?.full_name || 
                             user.user_metadata?.name);
    
    const hasAcceptedTerms = !!user.user_metadata?.terms_accepted;

    return !hasDisplayName || !hasAcceptedTerms;
  }

  /**
   * Check if error is network-related
   */
  private isNetworkError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message || error.toString();
    const networkIndicators = [
      'network',
      'connection',
      'timeout',
      'fetch',
      'offline',
      'unreachable'
    ];

    return networkIndicators.some(indicator => 
      errorMessage.toLowerCase().includes(indicator)
    );
  }

  /**
   * Get supported providers list
   */
  static getSupportedProviders(): string[] {
    return [...SocialAuthAdapter.SUPPORTED_PROVIDERS];
  }

  /**
   * Get provider display information
   */
  static getProviderInfo(provider: string): {
    name: string;
    color: string;
    iconName: string;
  } {
    const providerInfo: Record<string, { name: string; color: string; iconName: string }> = {
      google: {
        name: 'Google',
        color: '#4285F4',
        iconName: 'google'
      },
      apple: {
        name: 'Apple',
        color: '#000000',
        iconName: 'apple'
      },
      github: {
        name: 'GitHub',
        color: '#333333',
        iconName: 'github'
      },
      facebook: {
        name: 'Facebook',
        color: '#1877F2',
        iconName: 'facebook'
      }
    };

    return providerInfo[provider] || {
      name: provider,
      color: '#666666',
      iconName: 'user'
    };
  }
}