import { UserSession } from '../../business/entities/UserSession';
import { Logger } from '../../service/utils/Logger';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';
import { SessionMapper } from '../mappers/SessionMapper';

export class SessionRepository {
  constructor(
    private storageAdapter: LocalStorageAdapter = new LocalStorageAdapter(),
    private sessionMapper: SessionMapper = new SessionMapper()
  ) {}

  async save(session: UserSession): Promise<void> {
    try {
      const sessionData = this.sessionMapper.toStorage(session);
      await this.storageAdapter.setItem('user_session', sessionData);
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

      return session;
    } catch (error) {
      Logger.error('Failed to get session', { error });
      return null;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.storageAdapter.removeItem('user_session');
      Logger.debug('Session cleared successfully');
    } catch (error) {
      Logger.error('Failed to clear session', { error });
      throw error;
    }
  }

  async refresh(session: UserSession): Promise<void> {
    try {
      const refreshedSession = session.refresh();
      await this.save(refreshedSession);
      Logger.debug('Session refreshed successfully', { userId: session.userId });
    } catch (error) {
      Logger.error('Failed to refresh session', { error });
      throw error;
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
}
