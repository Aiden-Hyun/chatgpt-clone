import { ILogger } from '../../../service/interfaces/core';
import { GetStoredRouteParams, GetStoredRouteResult, IStorageService } from '../../interfaces';

export class GetStoredRouteUseCase {
  constructor(
    private storageService: IStorageService,
    private logger: ILogger
  ) {}

  async execute(params: GetStoredRouteParams): Promise<GetStoredRouteResult> {
    try {
      this.logger.info('GetStoredRouteUseCase: Getting stored route', {
        key: params.key
      });

      // Validate input
      if (!params.key || params.key.trim() === '') {
        return {
          success: false,
          error: 'Storage key is required'
        };
      }

      // Get stored route from storage service
      const result = await this.storageService.getItem(params.key);
      
      if (result === null) {
        this.logger.info('GetStoredRouteUseCase: No stored route found', {
          key: params.key
        });
        return {
          success: true,
          route: null
        };
      }

      this.logger.info('GetStoredRouteUseCase: Stored route retrieved', {
        key: params.key,
        hasRoute: !!result
      });

      return {
        success: true,
        route: result
      };

    } catch (error) {
      this.logger.error('GetStoredRouteUseCase: Error getting stored route', {
        error,
        key: params.key
      });
      return {
        success: false,
        error: 'Failed to get stored route'
      };
    }
  }
}
