import { Logger } from '../../../service/shared/utils/Logger';
import { UserSession , ISessionRepository , IUserRepository } from '../../interfaces';



export class RefreshTokenUseCase {
  constructor(
    private userRepository: IUserRepository,
    private sessionRepository: ISessionRepository
  ) {}

  async execute(request: RefreshTokenRequest): Promise<RefreshTokenResult> {
    try {
      Logger.info('RefreshTokenUseCase: Starting token refresh', { userId: request.userId });

      // Validate input
      if (!request.refreshToken || !request.userId) {
        return { 
          success: false, 
          error: 'Invalid refresh token or user ID' 
        };
      }

      // Call repository to refresh token via Supabase
      const refreshResult = await this.userRepository.refreshToken(request.refreshToken);
      if (!refreshResult.success) {
        Logger.warn('RefreshTokenUseCase: Token refresh failed', { 
          userId: request.userId, 
          error: refreshResult.error 
        });
        return { 
          success: false, 
          error: refreshResult.error,
          isNetworkError: refreshResult.isNetworkError 
        };
      }

      if (!refreshResult.session || !refreshResult.accessToken) {
        return { 
          success: false, 
          error: 'No session data returned from token refresh' 
        };
      }

      // Create new UserSession entity with updated tokens
      const updatedSession = new UserSession(
        request.userId,
        true,
        refreshResult.session.user?.user_metadata?.permissions || ['user'],
        new Date(),
        new Date(refreshResult.session.expires_at! * 1000), // Convert to Date
        refreshResult.session.refresh_token || request.refreshToken,
        refreshResult.accessToken
      );

      // Save updated session to storage
      const saveResult = await this.sessionRepository.save(updatedSession);
      if (!saveResult.success) {
        Logger.error('RefreshTokenUseCase: Failed to save refreshed session', { 
          userId: request.userId, 
          error: saveResult.error 
        });
        return { 
          success: false, 
          error: 'Failed to save refreshed session' 
        };
      }

      Logger.info('RefreshTokenUseCase: Token refreshed successfully', { userId: request.userId });

      return { 
        success: true, 
        session: updatedSession 
      };

    } catch (error) {
      Logger.error('RefreshTokenUseCase: Token refresh failed', { 
        error, 
        userId: request.userId 
      });
      return { 
        success: false, 
        error: 'Token refresh failed',
        isNetworkError: true
      };
    }
  }
}
