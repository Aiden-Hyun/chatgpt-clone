import { Logger } from '../../../service/shared/utils/Logger';
import { UserSession , ISessionRepository , IAuthEventEmitter } from '../../interfaces';



export class MonitorAuthStateUseCase {
  constructor(
    private authEventEmitter: IAuthEventEmitter,
    private sessionRepository: ISessionRepository
  ) {}

  async execute(): Promise<MonitorAuthStateResult> {
    try {
      Logger.info('MonitorAuthStateUseCase: Starting auth state monitoring');

      // Subscribe to auth events from Supabase
      const unsubscribe = this.authEventEmitter.subscribeToAuthChanges(
        async (event, session) => {
          try {
            Logger.info('MonitorAuthStateUseCase: Auth state changed', { 
              event, 
              hasSession: !!session 
            });

            await this.handleAuthStateChange(event, session);
          } catch (error) {
            Logger.error('MonitorAuthStateUseCase: Error handling auth state change', { 
              error, 
              event 
            });
          }
        }
      );

      Logger.info('MonitorAuthStateUseCase: Auth state monitoring started successfully');

      return {
        success: true,
        unsubscribe
      };

    } catch (error) {
      Logger.error('MonitorAuthStateUseCase: Failed to start auth state monitoring', { error });
      return {
        success: false,
        error: 'Failed to start auth state monitoring'
      };
    }
  }

  private async handleAuthStateChange(
    event: string, 
    supabaseSession: {
      user?: {
        id: string;
        user_metadata?: {
          permissions?: string[];
        };
      };
      expires_at?: number;
      refresh_token?: string;
      access_token?: string;
    }
  ): Promise<void> {
    switch (event) {
      case 'SIGNED_IN':
        await this.handleSignIn(supabaseSession);
        break;
      
      case 'SIGNED_OUT':
        await this.handleSignOut();
        break;
      
      case 'TOKEN_REFRESHED':
        await this.handleTokenRefresh(supabaseSession);
        break;
      
      case 'USER_UPDATED':
        await this.handleUserUpdate(supabaseSession);
        break;
      
      default:
        Logger.warn('MonitorAuthStateUseCase: Unknown auth event', { event });
    }
  }

  private async handleSignIn(supabaseSession: {
    user?: {
      id: string;
      user_metadata?: {
        permissions?: string[];
      };
    };
    expires_at?: number;
    refresh_token?: string;
    access_token?: string;
  }): Promise<void> {
    if (!supabaseSession?.user) {
      Logger.warn('MonitorAuthStateUseCase: Sign in event without user data');
      return;
    }

    try {
      // Create UserSession from Supabase session
      const userSession = new UserSession(
        supabaseSession.user.id,
        true,
        supabaseSession.user.user_metadata?.permissions || ['user'],
        new Date(),
        new Date(supabaseSession.expires_at * 1000),
        supabaseSession.refresh_token,
        supabaseSession.access_token
      );

      // Save session to repository
      const saveResult = await this.sessionRepository.save(userSession);
      if (!saveResult.success) {
        Logger.error('MonitorAuthStateUseCase: Failed to save session on sign in', { 
          error: saveResult.error 
        });
      } else {
        Logger.info('MonitorAuthStateUseCase: Session saved on sign in', { 
          userId: supabaseSession.user.id 
        });
      }
    } catch (error) {
      Logger.error('MonitorAuthStateUseCase: Error handling sign in', { error });
    }
  }

  private async handleSignOut(): Promise<void> {
    try {
      await this.sessionRepository.clear();
      Logger.info('MonitorAuthStateUseCase: Session cleared on sign out');
    } catch (error) {
      Logger.error('MonitorAuthStateUseCase: Error clearing session on sign out', { error });
    }
  }

  private async handleTokenRefresh(supabaseSession: {
    user?: {
      id: string;
      user_metadata?: {
        permissions?: string[];
      };
    };
    expires_at?: number;
    refresh_token?: string;
    access_token?: string;
  }): Promise<void> {
    if (!supabaseSession?.user) {
      Logger.warn('MonitorAuthStateUseCase: Token refresh event without user data');
      return;
    }

    try {
      // Update session with new tokens
      const userSession = new UserSession(
        supabaseSession.user.id,
        true,
        supabaseSession.user.user_metadata?.permissions || ['user'],
        new Date(),
        new Date(supabaseSession.expires_at * 1000),
        supabaseSession.refresh_token,
        supabaseSession.access_token
      );

      const saveResult = await this.sessionRepository.save(userSession);
      if (!saveResult.success) {
        Logger.error('MonitorAuthStateUseCase: Failed to save session on token refresh', { 
          error: saveResult.error 
        });
      } else {
        Logger.info('MonitorAuthStateUseCase: Session updated on token refresh', { 
          userId: supabaseSession.user.id 
        });
      }
    } catch (error) {
      Logger.error('MonitorAuthStateUseCase: Error handling token refresh', { error });
    }
  }

  private async handleUserUpdate(supabaseSession: {
    user?: {
      id: string;
      user_metadata?: {
        permissions?: string[];
      };
    };
    expires_at?: number;
    refresh_token?: string;
    access_token?: string;
  }): Promise<void> {
    if (!supabaseSession?.user) {
      Logger.warn('MonitorAuthStateUseCase: User update event without user data');
      return;
    }

    try {
      // Get current session and update with new user data
      const currentSession = await this.sessionRepository.get();
      if (currentSession && currentSession.userId === supabaseSession.user.id) {
        const updatedSession = new UserSession(
          supabaseSession.user.id,
          currentSession.isActive,
          supabaseSession.user.user_metadata?.permissions || currentSession.permissions,
          currentSession.createdAt,
          currentSession.expiresAt,
          currentSession.refreshToken,
          currentSession.accessToken
        );

        const saveResult = await this.sessionRepository.save(updatedSession);
        if (!saveResult.success) {
          Logger.error('MonitorAuthStateUseCase: Failed to save session on user update', { 
            error: saveResult.error 
          });
        } else {
          Logger.info('MonitorAuthStateUseCase: Session updated on user update', { 
            userId: supabaseSession.user.id 
          });
        }
      }
    } catch (error) {
      Logger.error('MonitorAuthStateUseCase: Error handling user update', { error });
    }
  }
}
