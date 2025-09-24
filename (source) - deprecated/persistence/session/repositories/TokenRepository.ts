import { Logger } from '../../../service/shared/utils/Logger';
import { TokenData } from '../../interfaces/session';
import { SecureStorageAdapter } from '../adapters/SecureStorageAdapter';

export class TokenRepository {
  constructor(
    private storageAdapter: SecureStorageAdapter = new SecureStorageAdapter()
  ) {}

  async saveAccessToken(token: string): Promise<void> {
    try {
      await this.storageAdapter.setItem('access_token', token);
      Logger.debug('Access token saved');
    } catch (error) {
      Logger.error('Failed to save access token', { error });
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      return await this.storageAdapter.getItem('access_token');
    } catch (error) {
      Logger.error('Failed to get access token', { error });
      return null;
    }
  }

  async saveRefreshToken(token: string): Promise<void> {
    try {
      await this.storageAdapter.setItem('refresh_token', token);
      Logger.debug('Refresh token saved');
    } catch (error) {
      Logger.error('Failed to save refresh token', { error });
      throw error;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await this.storageAdapter.getItem('refresh_token');
    } catch (error) {
      Logger.error('Failed to get refresh token', { error });
      return null;
    }
  }

  async saveTokens(tokens: TokenData): Promise<void> {
    try {
      await Promise.all([
        this.saveAccessToken(tokens.accessToken),
        this.saveRefreshToken(tokens.refreshToken),
        this.storageAdapter.setItem('token_expires_at', tokens.expiresAt.toString()),
        this.storageAdapter.setItem('token_type', tokens.tokenType)
      ]);
      Logger.debug('All tokens saved');
    } catch (error) {
      Logger.error('Failed to save tokens', { error });
      throw error;
    }
  }

  async getTokens(): Promise<TokenData | null> {
    try {
      const [accessToken, refreshToken, expiresAtStr, tokenType] = await Promise.all([
        this.getAccessToken(),
        this.getRefreshToken(),
        this.storageAdapter.getItem('token_expires_at'),
        this.storageAdapter.getItem('token_type')
      ]);

      if (!accessToken || !refreshToken || !expiresAtStr || !tokenType) {
        return null;
      }

      return {
        accessToken,
        refreshToken,
        expiresAt: parseInt(expiresAtStr, 10),
        tokenType
      };
    } catch (error) {
      Logger.error('Failed to get tokens', { error });
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        this.storageAdapter.removeItem('access_token'),
        this.storageAdapter.removeItem('refresh_token'),
        this.storageAdapter.removeItem('token_expires_at'),
        this.storageAdapter.removeItem('token_type')
      ]);
      Logger.debug('All tokens cleared');
    } catch (error) {
      Logger.error('Failed to clear tokens', { error });
      throw error;
    }
  }

  async isTokenExpired(): Promise<boolean> {
    try {
      const expiresAtStr = await this.storageAdapter.getItem('token_expires_at');
      if (!expiresAtStr) {
        return true;
      }

      const expiresAt = parseInt(expiresAtStr, 10);
      const now = Date.now();
      
      return now >= expiresAt;
    } catch (error) {
      Logger.error('Failed to check token expiry', { error });
      return true;
    }
  }

  async hasValidTokens(): Promise<boolean> {
    try {
      const tokens = await this.getTokens();
      if (!tokens) {
        return false;
      }

      const isExpired = await this.isTokenExpired();
      return !isExpired;
    } catch (error) {
      Logger.error('Failed to check token validity', { error });
      return false;
    }
  }
}
