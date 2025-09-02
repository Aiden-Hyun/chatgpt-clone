import { Logger } from '../../../service/shared/utils/Logger';
import { IAuthEventEmitter, ISessionRepository, MonitorAuthStateResult, UserSession } from '../../interfaces';

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
    // Get current session for comparison to prevent redundant processing
    const currentSession = await this.sessionRepository.get();
    
    switch (event) {
      case 'SIGNED_IN':
        await this.handleSignIn(supabaseSession, currentSession);
        break;
      
      case 'SIGNED_OUT':
        await this.handleSignOut();
        break;
      
      case 'TOKEN_REFRESHED':
        await this.handleTokenRefresh(supabaseSession, currentSession);
        break;
      
      case 'USER_UPDATED':
        await this.handleUserUpdate(supabaseSession, currentSession);
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
  }, currentSession: UserSession | null): Promise<void> {
    if (!supabaseSession?.user) {
      Logger.warn('MonitorAuthStateUseCase: Sign in event without user data');
      return;
    }

    try {
      // Create UserSession from Supabase session
      const userSession = new UserSession(
        supabaseSession.user.id,
        supabaseSession.access_token || '',
        new Date((supabaseSession.expires_at || 0) * 1000),
        undefined, // userEmail
        new Date(), // createdAt
        supabaseSession.refresh_token
      );

      // Check if this session is actually different from current session
      if (currentSession && this.areSessionsEquivalent(currentSession, userSession)) {
        Logger.debug('MonitorAuthStateUseCase: Sign in session unchanged, skipping save', {
          userId: supabaseSession.user.id
        });
        return;
      }

      // Save session to repository (repository has its own comparison, but this prevents unnecessary calls)
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
  }, currentSession: UserSession | null): Promise<void> {
    if (!supabaseSession?.user) {
      Logger.warn('MonitorAuthStateUseCase: Token refresh event without user data');
      return;
    }

    try {
      // Update session with new tokens
      const userSession = new UserSession(
        supabaseSession.user.id,
        supabaseSession.access_token || '',
        new Date((supabaseSession.expires_at || 0) * 1000),
        undefined, // userEmail
        new Date(), // createdAt
        supabaseSession.refresh_token
      );

      // Check if this session is actually different from current session
      if (currentSession && this.areSessionsEquivalent(currentSession, userSession)) {
        Logger.debug('MonitorAuthStateUseCase: Token refresh session unchanged, skipping save', {
          userId: supabaseSession.user.id
        });
        return;
      }

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
  }, currentSession: UserSession | null): Promise<void> {
    if (!supabaseSession?.user) {
      Logger.warn('MonitorAuthStateUseCase: User update event without user data');
      return;
    }

    try {
      // Update with new user data if current session exists and matches user
      if (currentSession && currentSession.userId === supabaseSession.user.id) {
        const updatedSession = new UserSession(
          supabaseSession.user.id,
          currentSession.accessToken,
          currentSession.expiresAt,
          currentSession.userEmail,
          currentSession.createdAt,
          currentSession.refreshToken
        );

        // Check if this session is actually different from current session
        if (this.areSessionsEquivalent(currentSession, updatedSession)) {
          Logger.debug('MonitorAuthStateUseCase: User update session unchanged, skipping save', {
            userId: supabaseSession.user.id
          });
          return;
        }

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

  /**
   * Compare two sessions to determine if they are functionally equivalent
   * Used to prevent redundant saves and reduce event noise
   */
  private areSessionsEquivalent(session1: UserSession, session2: UserSession): boolean {
    try {
      return (
        session1.userId === session2.userId &&
        session1.accessToken === session2.accessToken &&
        session1.expiresAt.getTime() === session2.expiresAt.getTime() &&
        session1.refreshToken === session2.refreshToken &&
        session1.userEmail === session2.userEmail
      );
    } catch (error) {
      Logger.warn('MonitorAuthStateUseCase: Failed to compare sessions, assuming different', { error });
      return false;
    }
  }
}
