import { ILogger } from '../../../service/shared/interfaces/ILogger';
import { IUserRepository, UpdateUserProfileParams, UpdateUserProfileResult } from '../../interfaces';

export class UpdateUserProfileUseCase {
  constructor(
    private userRepository: IUserRepository,
    private logger: ILogger
  ) {}

  async execute(params: UpdateUserProfileParams): Promise<UpdateUserProfileResult> {
    try {
      this.logger.info('UpdateUserProfileUseCase: Starting profile update', {
        userId: params.userId,
        hasDisplayName: !!params.displayName,
        hasAvatarUrl: !!params.avatarUrl
      });

      // Validate input
      if (!params.userId || params.userId.trim() === '') {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      // Validate profile data
      if (!params.displayName && !params.avatarUrl) {
        return {
          success: false,
          error: 'At least one profile field must be provided'
        };
      }

      if (params.displayName && params.displayName.trim() === '') {
        return {
          success: false,
          error: 'Display name cannot be empty'
        };
      }

      // Update user profile through repository
      const result = await this.userRepository.updateProfile(params.userId, {
        displayName: params.displayName,
        avatarUrl: params.avatarUrl
      });

      if (!result.success) {
        this.logger.warn('UpdateUserProfileUseCase: Failed to update profile', {
          userId: params.userId,
          error: result.error
        });
        return result;
      }

      this.logger.info('UpdateUserProfileUseCase: Profile updated successfully', {
        userId: params.userId,
        hasUpdatedProfile: !!result.profile
      });

      return {
        success: true,
        profile: result.profile
      };

    } catch (error) {
      this.logger.error('UpdateUserProfileUseCase: Error updating profile', {
        error,
        userId: params.userId
      });
      return {
        success: false,
        error: 'Failed to update user profile'
      };
    }
  }
}
