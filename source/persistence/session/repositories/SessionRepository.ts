import { Logger } from '../../../service/shared/utils/Logger';
import { ISessionRepository, RefreshResult, SaveSessionResult, UserSession } from '../../interfaces/session';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';
import { SecureStorageAdapter } from '../adapters/SecureStorageAdapter';
import { SupabaseSessionAdapter } from '../adapters/SupabaseSessionAdapter';
import { SessionMapper } from '../mappers/SessionMapper';
import { TokenRepository } from './TokenRepository';

export class SessionRepository implements ISessionRepository {
  constructor(
    private storageAdapter: LocalStorageAdapter = new LocalStorageAdapter(),
    private secureStorageAdapter: SecureStorageAdapter = new SecureStorageAdapter(),
    private supabaseAdapter: SupabaseSessionAdapter = new SupabaseSessionAdapter(),
    private sessionMapper: SessionMapper = new SessionMapper(),
    private tokenRepository: TokenRepository = new TokenRepository()
  ) {}

  async save(session: UserSession): Promise<SaveSessionResult> {
    try {
      const sessionData = this.sessionMapper.toStorage(session);
      await this.storageAdapter.setItem('user_session', sessionData);
      
      // Save tokens separately in secure storage
      if (session.accessToken) {
        await this.tokenRepository.saveAccessToken(session.accessToken);
      }
      if (session.refreshToken) {
        await this.tokenRepository.saveRefreshToken(session.refreshToken);
      }
      
      Logger.debug('Session saved successfully', { userId: session.userId });
      return { success: true };
    } catch (error) {
      Logger.error('Failed to save session', { error });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save session' 
      };
    }
  }

  async get(): Promise<UserSession | null> {
    try {
      const sessionData = await this.storageAdapter.getItem('user_session');
      if (!sessionData) {
        return null;
      }

      const session = this.sessionMapper.toDomain(sessionData);
      
      // Check if session is expired
      if (session.isExpired()) {
        await this.clear();
        return null;
      }

      // Load tokens from secure storage
      const accessToken = await this.tokenRepository.getAccessToken();
      const refreshToken = await this.tokenRepository.getRefreshToken();
      
      if (accessToken && refreshToken) {
        return session.withTokens(accessToken, refreshToken);
      }

      return session;
    } catch (error) {
      Logger.error('Failed to get session', { error });
      return null;
    }
  }

  async clear(): Promise<void> {
    try {
      await Promise.all([
        this.storageAdapter.removeItem('user_session'),
        this.tokenRepository.clearTokens()
      ]);
      Logger.debug('Session cleared successfully');
    } catch (error) {
      Logger.error('Failed to clear session', { error });
      throw error;
    }
  }

  async refresh(refreshToken?: string): Promise<RefreshResult> {
    try {
      Logger.info('SessionRepository: Refreshing session', { hasRefreshToken: !!refreshToken });
      
      // Call Supabase to refresh the session
      const refreshData = await this.supabaseAdapter.refreshSession(refreshToken);
      
      if (refreshData.success && refreshData.session) {
        // Map Supabase session to our domain session
        const newSession = this.sessionMapper.fromSupabaseSession(refreshData.session);
        await this.save(newSession);
        
        Logger.info('SessionRepository: Session refreshed successfully', { userId: newSession.userId });
        return { success: true, session: newSession };
      } else {
        Logger.warn('SessionRepository: Session refresh failed', { error: refreshData.error });
        return { success: false, error: refreshData.error };
      }
    } catch (error) {
      Logger.error('SessionRepository: Session refresh failed', { error });
      return { success: false, error: 'Refresh failed' };
    }
  }

  async syncWithSupabase(): Promise<RefreshResult> {
    try {
      Logger.info('SessionRepository: Syncing with Supabase session');
      
      // Get current session from Supabase
      const supabaseData = await this.supabaseAdapter.getCurrentSession();
      
      if (supabaseData.success && supabaseData.session) {
        // Map Supabase session to our domain session
        const session = this.sessionMapper.fromSupabaseSession(supabaseData.session);
        await this.save(session);
        
        Logger.info('SessionRepository: Synced with Supabase successfully', { userId: session.userId });
        return { success: true, session };
      } else if (supabaseData.success && !supabaseData.session) {
        // No session in Supabase, clear local session
        await this.clear();
        Logger.info('SessionRepository: No Supabase session, cleared local session');
        return { success: false, error: 'No active session' };
      } else {
        Logger.warn('SessionRepository: Failed to sync with Supabase', { error: supabaseData.error });
        return { success: false, error: supabaseData.error };
      }
    } catch (error) {
      Logger.error('SessionRepository: Failed to sync with Supabase', { error });
      return { success: false, error: 'Sync failed' };
    }
  }

  async updateLastActivity(userId: string): Promise<void> {
    try {
      const session = await this.get();
      if (session && session.userId === userId) {
        const updatedSession = session.updateLastActivity();
        await this.save(updatedSession);
        Logger.debug('Session last activity updated', { userId });
      } else {
        Logger.warn('Cannot update last activity: session not found or user mismatch', { userId });
      }
    } catch (error) {
      Logger.error('Failed to update session last activity', { error });
      throw error;
    }
  }

  async isValid(session: UserSession): Promise<boolean> {
    try {
      if (!session || !session.isActive) {
        return false;
      }
      
      // Check if session is expired
      const now = new Date();
      return session.expiresAt > now;
    } catch (error) {
      Logger.error('Failed to check session validity', { error });
      return false;
    }
  }

  async getUserId(): Promise<string | null> {
    try {
      const session = await this.get();
      return session?.userId || null;
    } catch (error) {
      Logger.error('Failed to get user ID from session', { error });
      return null;
    }
  }

  async hasValidTokens(): Promise<boolean> {
    try {
      return await this.tokenRepository.hasValidTokens();
    } catch (error) {
      Logger.error('Failed to check token validity', { error });
      return false;
    }
  }
}
