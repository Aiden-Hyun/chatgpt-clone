import { UserSession } from '../../../business/session/entities/UserSession';
import { Logger } from '../../../service/shared/utils/Logger';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';
import { SecureStorageAdapter } from '../adapters/SecureStorageAdapter';
import { SessionMapper } from '../mappers/SessionMapper';
import { TokenRepository } from './TokenRepository';

export interface RefreshResult {
  success: boolean;
  session?: UserSession;
  error?: string;
}

export class SessionRepository {
  constructor(
    private storageAdapter: LocalStorageAdapter = new LocalStorageAdapter(),
    private secureStorageAdapter: SecureStorageAdapter = new SecureStorageAdapter(),
    private sessionMapper: SessionMapper = new SessionMapper(),
    private tokenRepository: TokenRepository = new TokenRepository()
  ) {}

  async save(session: UserSession): Promise<void> {
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
    } catch (error) {
      Logger.error('Failed to save session', { error });
      throw error;
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

  async refresh(refreshToken: string): Promise<RefreshResult> {
    try {
      // Call Supabase to refresh the session
      const refreshData = await this.supabaseAdapter.refreshSession(refreshToken);
      
      if (refreshData.success) {
        const newSession = this.sessionMapper.toDomain(refreshData.session);
        await this.save(newSession);
        return { success: true, session: newSession };
      } else {
        return { success: false, error: refreshData.error };
      }
    } catch (error) {
      Logger.error('Session refresh failed', { error });
      return { success: false, error: 'Refresh failed' };
    }
  }

  async updateLastActivity(session: UserSession): Promise<void> {
    try {
      const updatedSession = session.updateLastActivity();
      await this.save(updatedSession);
      Logger.debug('Session last activity updated', { userId: session.userId });
    } catch (error) {
      Logger.error('Failed to update session last activity', { error });
      throw error;
    }
  }

  async isValid(): Promise<boolean> {
    try {
      const session = await this.get();
      return session !== null && session.isActive();
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
