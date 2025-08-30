import { ILogger } from '../../../service/interfaces/core';
import { GetUserProfileParams, GetUserProfileResult, IUserRepository } from '../../interfaces';

export class GetUserProfileUseCase {
  constructor(
    private userRepository: IUserRepository,
    private logger: ILogger
  ) {}

  async execute(params: GetUserProfileParams): Promise<GetUserProfileResult> {
    try {
      this.logger.info('GetUserProfileUseCase: Starting profile retrieval', {
        userId: params.userId
      });

      // Validate input
      if (!params.userId || params.userId.trim() === '') {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      // Get user profile from repository
      const result = await this.userRepository.getProfile(params.userId);
      
      if (!result.success) {
        this.logger.warn('GetUserProfileUseCase: Failed to get profile', {
          userId: params.userId,
          error: result.error
        });
        return result;
      }

      this.logger.info('GetUserProfileUseCase: Profile retrieved successfully', {
        userId: params.userId,
        hasProfile: !!result.profile
      });

      return {
        success: true,
        profile: result.profile
      };

    } catch (error) {
      this.logger.error('GetUserProfileUseCase: Error getting profile', {
        error,
        userId: params.userId
      });
      return {
        success: false,
        error: 'Failed to get user profile'
      };
    }
  }
}
