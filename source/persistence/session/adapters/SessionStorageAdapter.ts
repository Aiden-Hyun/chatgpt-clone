import { Logger } from '../../../service/shared/utils/Logger';
import { SecureStorageAdapter } from '../../auth/adapters/SecureStorageAdapter';
import { UserSession } from '../../interfaces/session';

export interface SessionStorageResult {
  success: boolean;
  error?: string;
}

export interface SessionData {
  userId: string;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
  expiresAt: string;
  lastActivity?: string;
}

export class SessionStorageAdapter {
  private static readonly SESSION_KEY = 'user_session_data';
  private static readonly ACCESS_TOKEN_KEY = 'session_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'session_refresh_token';

  constructor(
    private secureStorage: SecureStorageAdapter = new SecureStorageAdapter()
  ) {}

  /**
   * Save session to secure storage
   * @param session UserSession to save
   * @returns Storage result
   */
  async saveSession(session: UserSession): Promise<SessionStorageResult> {
    try {
      Logger.info('SessionStorageAdapter: Saving session', { userId: session.userId });

      // Prepare session data (without tokens)
      const sessionData: SessionData = {
        userId: session.userId,
        isActive: session.isActive,
        permissions: session.permissions,
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        lastActivity: session.lastActivity?.toISOString()
      };

      // Save session data
      await this.secureStorage.setItem(
        SessionStorageAdapter.SESSION_KEY,
        JSON.stringify(sessionData)
      );

      // Save tokens separately for enhanced security
      if (session.accessToken) {
        await this.secureStorage.setItem(
          SessionStorageAdapter.ACCESS_TOKEN_KEY,
          session.accessToken
        );
      }

      if (session.refreshToken) {
        await this.secureStorage.setItem(
          SessionStorageAdapter.REFRESH_TOKEN_KEY,
          session.refreshToken
        );
      }

      Logger.info('SessionStorageAdapter: Session saved successfully', { userId: session.userId });
      return { success: true };

    } catch (error) {
      Logger.error('SessionStorageAdapter: Failed to save session', { 
        error,
        userId: session.userId 
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save session'
      };
    }
  }

  /**
   * Get session from secure storage
   * @returns UserSession or null if not found
   */
  async getSession(): Promise<UserSession | null> {
    try {
      Logger.info('SessionStorageAdapter: Retrieving session');

      // Get session data
      const sessionDataStr = await this.secureStorage.getItem(SessionStorageAdapter.SESSION_KEY);
      if (!sessionDataStr) {
        Logger.info('SessionStorageAdapter: No session data found');
        return null;
      }

      const sessionData: SessionData = JSON.parse(sessionDataStr);

      // Get tokens
      const accessToken = await this.secureStorage.getItem(SessionStorageAdapter.ACCESS_TOKEN_KEY);
      const refreshToken = await this.secureStorage.getItem(SessionStorageAdapter.REFRESH_TOKEN_KEY);

      // Create UserSession
      const session = new UserSession(
        sessionData.userId,
        sessionData.isActive,
        sessionData.permissions,
        new Date(sessionData.createdAt),
        new Date(sessionData.expiresAt),
        refreshToken || '',
        accessToken || ''
      );

      // Set last activity if available
      if (sessionData.lastActivity) {
        session.lastActivity = new Date(sessionData.lastActivity);
      }

      Logger.info('SessionStorageAdapter: Session retrieved successfully', { 
        userId: sessionData.userId 
      });

      return session;

    } catch (error) {
      Logger.error('SessionStorageAdapter: Failed to get session', { error });
      return null;
    }
  }

  /**
   * Clear session from secure storage
   * @returns Storage result
   */
  async clearSession(): Promise<SessionStorageResult> {
    try {
      Logger.info('SessionStorageAdapter: Clearing session');

      // Remove all session-related data
      await Promise.all([
        this.secureStorage.removeItem(SessionStorageAdapter.SESSION_KEY),
        this.secureStorage.removeItem(SessionStorageAdapter.ACCESS_TOKEN_KEY),
        this.secureStorage.removeItem(SessionStorageAdapter.REFRESH_TOKEN_KEY)
      ]);

      Logger.info('SessionStorageAdapter: Session cleared successfully');
      return { success: true };

    } catch (error) {
      Logger.error('SessionStorageAdapter: Failed to clear session', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear session'
      };
    }
  }

  /**
   * Update session data (without tokens)
   * @param session UserSession with updated data
   * @returns Storage result
   */
  async updateSession(session: UserSession): Promise<SessionStorageResult> {
    try {
      Logger.info('SessionStorageAdapter: Updating session data', { userId: session.userId });

      // Get existing tokens to preserve them
      const existingAccessToken = await this.secureStorage.getItem(SessionStorageAdapter.ACCESS_TOKEN_KEY);
      const existingRefreshToken = await this.secureStorage.getItem(SessionStorageAdapter.REFRESH_TOKEN_KEY);

      // Update session with existing tokens if not provided
      const updatedSession = new UserSession(
        session.userId,
        session.isActive,
        session.permissions,
        session.createdAt,
        session.expiresAt,
        session.refreshToken || existingRefreshToken || '',
        session.accessToken || existingAccessToken || ''
      );

      if (session.lastActivity) {
        updatedSession.lastActivity = session.lastActivity;
      }

      // Save the updated session
      return await this.saveSession(updatedSession);

    } catch (error) {
      Logger.error('SessionStorageAdapter: Failed to update session', { 
        error,
        userId: session.userId 
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update session'
      };
    }
  }

  /**
   * Update only the access token
   * @param accessToken New access token
   * @returns Storage result
   */
  async updateAccessToken(accessToken: string): Promise<SessionStorageResult> {
    try {
      Logger.info('SessionStorageAdapter: Updating access token');

      await this.secureStorage.setItem(
        SessionStorageAdapter.ACCESS_TOKEN_KEY,
        accessToken
      );

      Logger.info('SessionStorageAdapter: Access token updated successfully');
      return { success: true };

    } catch (error) {
      Logger.error('SessionStorageAdapter: Failed to update access token', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update access token'
      };
    }
  }

  /**
   * Update only the refresh token
   * @param refreshToken New refresh token
   * @returns Storage result
   */
  async updateRefreshToken(refreshToken: string): Promise<SessionStorageResult> {
    try {
      Logger.info('SessionStorageAdapter: Updating refresh token');

      await this.secureStorage.setItem(
        SessionStorageAdapter.REFRESH_TOKEN_KEY,
        refreshToken
      );

      Logger.info('SessionStorageAdapter: Refresh token updated successfully');
      return { success: true };

    } catch (error) {
      Logger.error('SessionStorageAdapter: Failed to update refresh token', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update refresh token'
      };
    }
  }

  /**
   * Check if session exists in storage
   * @returns true if session exists
   */
  async hasSession(): Promise<boolean> {
    try {
      const sessionData = await this.secureStorage.getItem(SessionStorageAdapter.SESSION_KEY);
      return !!sessionData;
    } catch (error) {
      Logger.error('SessionStorageAdapter: Failed to check session existence', { error });
      return false;
    }
  }

  /**
   * Get session expiry time without loading full session
   * @returns Expiry date or null if no session
   */
  async getSessionExpiry(): Promise<Date | null> {
    try {
      const sessionDataStr = await this.secureStorage.getItem(SessionStorageAdapter.SESSION_KEY);
      if (!sessionDataStr) {
        return null;
      }

      const sessionData: SessionData = JSON.parse(sessionDataStr);
      return new Date(sessionData.expiresAt);

    } catch (error) {
      Logger.error('SessionStorageAdapter: Failed to get session expiry', { error });
      return null;
    }
  }

  /**
   * Get storage statistics
   * @returns Storage usage information
   */
  async getStorageInfo(): Promise<{
    hasSession: boolean;
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    sessionExpiry?: Date;
    userId?: string;
  }> {
    try {
      const [sessionData, accessToken, refreshToken] = await Promise.all([
        this.secureStorage.getItem(SessionStorageAdapter.SESSION_KEY),
        this.secureStorage.getItem(SessionStorageAdapter.ACCESS_TOKEN_KEY),
        this.secureStorage.getItem(SessionStorageAdapter.REFRESH_TOKEN_KEY)
      ]);

      let sessionExpiry: Date | undefined;
      let userId: string | undefined;

      if (sessionData) {
        try {
          const parsed: SessionData = JSON.parse(sessionData);
          sessionExpiry = new Date(parsed.expiresAt);
          userId = parsed.userId;
        } catch (parseError) {
          Logger.warn('SessionStorageAdapter: Failed to parse session data for info', { parseError });
        }
      }

      return {
        hasSession: !!sessionData,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        sessionExpiry,
        userId
      };

    } catch (error) {
      Logger.error('SessionStorageAdapter: Failed to get storage info', { error });
      return {
        hasSession: false,
        hasAccessToken: false,
        hasRefreshToken: false
      };
    }
  }
}
